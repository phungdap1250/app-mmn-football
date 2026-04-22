-- ============================================================
-- DATABASE SCHEMA — Mieng Moi Ngon F.C
-- Dựa trên TDD v1.2 (19/04/2026)
-- Chạy toàn bộ file này trong Supabase SQL Editor
-- ============================================================
-- Kiến trúc: Single-user (1 thủ quỹ duy nhất, xác định qua TREASURER_EMAIL)
-- Stack: Supabase PostgreSQL 15 + RLS + Supabase Auth (Google OAuth)
-- Thứ tự chạy:
--   1. Extensions
--   2. Tạo bảng (fund_settings → members → transactions)
--   3. Seed data mặc định
--   4. Bật RLS + Tạo Policies
--   5. Tạo Indexes
--   6. Tạo Triggers (updated_at — bắt buộc cho optimistic concurrency)
--   7. Stored Procedure (get_transaction_totals)
-- ============================================================


-- ============================================================
-- BƯỚC 1: EXTENSIONS
-- ============================================================

-- pgcrypto: dùng gen_random_bytes() để tạo public_token
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- BƯỚC 2: TẠO BẢNG
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- Bảng 1: fund_settings  (singleton — 1 row duy nhất toàn app)
-- Lưu: tên quỹ, số dư đầu kỳ, thông tin ngân hàng, public token
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fund_settings (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Thông tin quỹ
  fund_name       TEXT        NOT NULL DEFAULT 'Quỹ FC Mieng Moi Ngon'
                              CHECK (char_length(fund_name) <= 100),

  -- Số dư đầu kỳ: BIGINT tránh floating point, đơn vị VNĐ
  opening_balance BIGINT      NOT NULL DEFAULT 0,

  -- Thông tin ngân hàng — dùng để tạo QR VietQR (tuỳ chọn)
  bank_name       TEXT        CHECK (char_length(bank_name) <= 50),
  bank_account    TEXT        CHECK (char_length(bank_account) <= 30),
  bank_owner      TEXT        CHECK (char_length(bank_owner) <= 100),

  -- Email thủ quỹ — dùng cho RLS policy
  -- RLS chặn mọi user không có email khớp cột này, kể cả đã login Supabase Auth
  -- NOT NULL + DEFAULT '' để schema chạy được, nhưng BẮT BUỘC UPDATE sau khi chạy
  treasurer_email TEXT        NOT NULL DEFAULT ''
                              CHECK (char_length(treasurer_email) <= 100),

  -- Token chia sẻ công khai (32 ký tự hex = 16 bytes random)
  -- Revoke link bằng cách tạo token mới → link cũ hết hiệu lực ngay
  -- CHECK đảm bảo format đúng kể cả khi UPDATE trực tiếp qua SQL
  public_token    TEXT        UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex')
                              CHECK (char_length(public_token) = 32 AND public_token ~ '^[0-9a-f]+$'),

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  fund_settings              IS 'Cấu hình quỹ — singleton (1 row duy nhất)';
COMMENT ON COLUMN fund_settings.opening_balance IS 'Số dư đầu kỳ (VNĐ). Cộng vào tổng: balance = opening_balance + SUM(income) - SUM(expense)';
COMMENT ON COLUMN fund_settings.public_token    IS 'Token 32 ký tự hex. Revoke = UPDATE cột này. API /api/public/[token] dùng service role key để query — không expose qua client.';

-- Singleton enforcement: chỉ cho phép tối đa 1 row trong fund_settings
-- Chặn cứng kể cả khi có bug INSERT hoặc race condition
CREATE UNIQUE INDEX IF NOT EXISTS idx_fund_settings_singleton
  ON fund_settings ((TRUE));


-- ──────────────────────────────────────────────────────────────
-- Bảng 2: members
-- Danh sách thành viên đội bóng
-- Không phải user, không đăng nhập — chỉ để thủ quỹ chọn khi ghi thu
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS members (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT        NOT NULL CHECK (char_length(name) <= 50),

  -- Tuỳ chọn — dùng phân biệt khi trùng tên
  phone          TEXT CHECK (char_length(phone) <= 20),
  jersey_number  TEXT CHECK (char_length(jersey_number) <= 5),   -- TEXT vì số áo có thể là "007", không dùng để tính toán

  -- Timestamps
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  members              IS 'Thành viên đội bóng — không phải tài khoản đăng nhập';
COMMENT ON COLUMN members.jersey_number IS 'Số áo — TEXT (có thể là "007"). Không giới hạn unique để tránh phức tạp khi đổi số áo.';


-- ──────────────────────────────────────────────────────────────
-- Bảng 3: transactions  (bảng trung tâm — Thu + Chi trong 1 bảng)
-- Lý do single-table: query "10 giao dịch gần nhất" và tính số dư chỉ cần 1 SELECT
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Loại giao dịch
  type    TEXT   NOT NULL CHECK (type IN ('income', 'expense')),

  -- Số tiền: luôn dương, đơn vị VNĐ
  amount  BIGINT NOT NULL CHECK (amount > 0),

  -- Ngày giao dịch: kiểu DATE (không cần giờ phút giây)
  -- Validation "date <= todayVN()" thực hiện ở API layer — không ở DB
  -- Lý do: server Vercel chạy UTC, dùng CURRENT_DATE ở DB sẽ sai lúc 0h-7h sáng VN
  date    DATE   NOT NULL,

  -- Ghi chú (dùng cho cả income lẫn expense)
  note    TEXT   CHECK (char_length(note) <= 200),


  -- ── Chỉ dùng cho Thu (income) ──────────────────────────────
  -- Khi member bị xoá: member_id → NULL (ON DELETE SET NULL)
  -- member_name_snapshot giữ lại tên để UI không hiện trống
  member_id            UUID REFERENCES members(id) ON DELETE SET NULL ON UPDATE NO ACTION,
  member_name_snapshot TEXT CHECK (char_length(member_name_snapshot) <= 50),
  -- Logic snapshot (thực hiện ở API lúc INSERT):
  --   1. Query: SELECT name FROM members WHERE id = $memberId
  --   2. Ghi kết quả vào cột này ngay khi INSERT
  --   3. KHÔNG cập nhật lại nếu member đổi tên sau đó
  -- UI dùng "live + fallback" (xem TDD Section 2.3 — Phương án B):
  --   displayName = members.find(m => m.id === tx.member_id)?.name    -- 1. live
  --              || tx.member_name_snapshot                             -- 2. fallback khi member đã xoá
  --              || 'Thành viên đã xoá';                               -- 3. cuối cùng


  -- ── Chỉ dùng cho Chi (expense) ─────────────────────────────
  category        TEXT CHECK (category IN (
                    'Tiền sân',
                    'Tiền nước',
                    'Trọng tài',
                    'Liên hoan',
                    'Khác'
                  )),
  category_custom TEXT CHECK (char_length(category_custom) <= 50),
  -- Bắt buộc có giá trị khi category = 'Khác' (enforced tại API layer)

  match_result    TEXT CHECK (match_result IN (
                    'Thắng',
                    'Hoà',
                    'Thua',
                    'Không liên quan đến trận'
                  )),


  -- ── Idempotency (chặn double-submit) ───────────────────────
  -- Client generate crypto.randomUUID() mỗi lần mount form CREATE
  -- Server: SELECT trước → nếu đã tồn tại, trả 200 + record cũ, KHÔNG INSERT mới
  -- UNIQUE enforce qua partial index (xem BƯỚC 5) — cho phép SET NULL để dọn key cũ
  idempotency_key UUID,


  -- ── Timestamps ─────────────────────────────────────────────
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- updated_at: dùng cho Optimistic Concurrency Control
  -- PUT/DELETE phải gửi kèm expectedUpdatedAt
  -- Server: UPDATE ... WHERE id = $id AND updated_at = $expectedUpdatedAt
  -- Nếu rowCount = 0 → 409 Conflict (đã có session khác sửa trước)
  -- Trigger trg_transactions_updated_at đảm bảo cột này luôn tự cập nhật khi UPDATE
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),


  -- ── Data integrity constraints (enforce tại DB, không tin API) ──
  -- Lớp bảo vệ cuối cùng: nếu API bug hoặc ai query trực tiếp DB,
  -- những ràng buộc này chặn không cho tạo row rác.
  -- Income phải có snapshot tên — không yêu cầu member_id vì member có thể bị xoá
  -- (ON DELETE SET NULL → member_id trở thành NULL, snapshot giữ nguyên làm chứng từ)
  -- Yêu cầu member_id NOT NULL lúc INSERT enforce ở API layer
  CONSTRAINT chk_income_requires_snapshot CHECK (
    type = 'expense' OR member_name_snapshot IS NOT NULL
  ),
  CONSTRAINT chk_expense_requires_category CHECK (
    type = 'income' OR category IS NOT NULL
  ),
  CONSTRAINT chk_khac_requires_custom CHECK (
    category IS DISTINCT FROM 'Khác' OR category_custom IS NOT NULL
  ),
  CONSTRAINT chk_income_no_expense_fields CHECK (
    type = 'expense' OR (category IS NULL AND category_custom IS NULL AND match_result IS NULL)
  )
);

COMMENT ON TABLE  transactions                      IS 'Giao dịch thu + chi. Single table, phân biệt bằng cột type.';
COMMENT ON COLUMN transactions.date                 IS 'Ngày giao dịch theo giờ VN. Validation date <= todayVN() ở API layer, không ở DB (server UTC != VN timezone).';
COMMENT ON COLUMN transactions.member_name_snapshot IS 'Snapshot tên thành viên lúc INSERT. Dùng làm fallback khi member bị xoá (member_id = NULL). Không tự cập nhật khi member đổi tên.';
COMMENT ON COLUMN transactions.idempotency_key      IS 'UUID v4 do client sinh. Server dùng để chặn double-submit. UNIQUE constraint ở DB ngăn race condition.';
COMMENT ON COLUMN transactions.updated_at           IS 'Tự cập nhật qua trigger. Dùng cho optimistic concurrency: PUT/DELETE gửi kèm expectedUpdatedAt, server WHERE updated_at = ? để phát hiện conflict.';


-- ============================================================
-- BƯỚC 3: SEED DATA MẶC ĐỊNH
-- ============================================================

-- Tạo row duy nhất cho fund_settings khi khởi tạo DB
-- ON CONFLICT DO NOTHING: chạy lại script không bị lỗi duplicate
-- ⚠️ treasurer_email để rỗng — BẮT BUỘC UPDATE ngay sau khi chạy schema:
--     UPDATE fund_settings SET treasurer_email = 'phungdap93@gmail.com';
-- Nếu không set, RLS policy sẽ chặn toàn bộ truy cập (kể cả của thủ quỹ).
INSERT INTO fund_settings (fund_name, opening_balance, treasurer_email)
VALUES ('Quỹ FC Mieng Moi Ngon', 0, '')
ON CONFLICT DO NOTHING;


-- ============================================================
-- BƯỚC 4: BẬT ROW LEVEL SECURITY (RLS) + TẠO POLICIES
-- ============================================================
-- Chiến lược bảo mật 2 lớp:
--   Lớp 1 (API layer): withAuth() kiểm tra session.user.email === TREASURER_EMAIL (fail sớm)
--   Lớp 2 (DB layer):  RLS check auth.jwt() email === fund_settings.treasurer_email
--                      → chặn ngay cả khi anon key bị leak + login Google khác
-- Public token (/api/public/[token]) dùng service role key ở API Route
-- → bypass RLS có kiểm soát, service role key TUYỆT ĐỐI không expose qua client
-- ============================================================

ALTER TABLE fund_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions  ENABLE ROW LEVEL SECURITY;

-- Policy: chỉ thủ quỹ (email khớp fund_settings.treasurer_email) mới được truy cập
-- WITH CHECK bắt buộc — chặn INSERT/UPDATE row với giá trị rác khi bypass API layer
-- Service role key (dùng cho /api/public/[token]) bypass RLS hoàn toàn — phải giữ server-side only

CREATE POLICY "treasurer_only" ON fund_settings
  FOR ALL
  USING      (auth.jwt() ->> 'email' = treasurer_email)
  WITH CHECK (auth.jwt() ->> 'email' = treasurer_email);

CREATE POLICY "treasurer_only" ON members
  FOR ALL
  USING      (auth.jwt() ->> 'email' = (SELECT treasurer_email FROM fund_settings LIMIT 1))
  WITH CHECK (auth.jwt() ->> 'email' = (SELECT treasurer_email FROM fund_settings LIMIT 1));

CREATE POLICY "treasurer_only" ON transactions
  FOR ALL
  USING      (auth.jwt() ->> 'email' = (SELECT treasurer_email FROM fund_settings LIMIT 1))
  WITH CHECK (auth.jwt() ->> 'email' = (SELECT treasurer_email FROM fund_settings LIMIT 1));


-- ============================================================
-- BƯỚC 5: TẠO INDEXES
-- ============================================================

-- Tăng tốc query SUM balance (SELECT type, amount FROM transactions)
-- INCLUDE (amount): index-only scan, không cần heap access
CREATE INDEX IF NOT EXISTS idx_transactions_type_amount
  ON transactions(type) INCLUDE (amount);

-- Compound index: date DESC + created_at DESC
-- Hỗ trợ Q3 (10 giao dịch gần nhất — ORDER BY date DESC, created_at DESC) không cần sort RAM
-- Hỗ trợ Q2 (monthly summary — WHERE date BETWEEN ...) vì date là cột leading
CREATE INDEX IF NOT EXISTS idx_transactions_date_created
  ON transactions(date DESC, created_at DESC);

-- Tăng tốc JOIN members khi lấy tên giao dịch
-- Partial index: chỉ index income (member_id NOT NULL), bỏ qua expense
CREATE INDEX IF NOT EXISTS idx_transactions_member_id
  ON transactions(member_id)
  WHERE member_id IS NOT NULL;

-- Không cần index riêng trên updated_at — optimistic concurrency query dạng:
--   WHERE id = $id AND updated_at = $expected
-- Planner luôn dùng PK index (id), sau đó filter updated_at trên 1 row (free).

-- Tăng tốc sort danh sách thành viên
CREATE INDEX IF NOT EXISTS idx_members_name
  ON members(name ASC);

-- Idempotency key — partial unique index
-- Chỉ UNIQUE khi NOT NULL → cho phép cronjob SET idempotency_key = NULL
-- với row cũ (>7 ngày) để dọn rác, không vi phạm constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_idempotency_key
  ON transactions(idempotency_key)
  WHERE idempotency_key IS NOT NULL;


-- ============================================================
-- BƯỚC 6: TRIGGERS — Tự động cập nhật updated_at
-- ============================================================
-- BẮT BUỘC PHẢI CÓ:
--   Nếu không có trigger, updated_at không tự thay đổi khi UPDATE
--   → Optimistic concurrency không phát hiện được conflict
--   → 2 thủ quỹ dùng 2 thiết bị có thể ghi đè dữ liệu nhau
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger cho transactions (quan trọng nhất — optimistic concurrency)
CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger cho members
CREATE TRIGGER trg_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger cho fund_settings
CREATE TRIGGER trg_fund_settings_updated_at
  BEFORE UPDATE ON fund_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- TRIGGER BẢO VỆ SINGLETON: chặn DELETE / TRUNCATE fund_settings
-- ============================================================
-- Nếu row duy nhất bị xoá:
--   - opening_balance mất vĩnh viễn (trừ khi có backup)
--   - treasurer_email mất → RLS policy so email với NULL → mọi truy cập bị deny → app chết
--   - public_token mất → link chia sẻ hết hiệu lực
-- → Phải chặn DELETE, muốn reset thì UPDATE từng cột.
-- Khi cần bypass (test/migration):
--   ALTER TABLE fund_settings DISABLE TRIGGER trg_prevent_fund_settings_delete;
-- ============================================================

CREATE OR REPLACE FUNCTION prevent_fund_settings_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Không được xoá fund_settings (singleton). Dùng UPDATE để sửa giá trị.'
    USING HINT = 'Nếu cần reset quỹ, UPDATE từng cột về giá trị mặc định.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_fund_settings_delete
  BEFORE DELETE ON fund_settings
  FOR EACH ROW EXECUTE FUNCTION prevent_fund_settings_delete();

CREATE TRIGGER trg_prevent_fund_settings_truncate
  BEFORE TRUNCATE ON fund_settings
  FOR EACH STATEMENT EXECUTE FUNCTION prevent_fund_settings_delete();


-- ============================================================
-- BƯỚC 7: STORED PROCEDURE — get_transaction_totals()
-- Dùng trong lib/balance.ts để tính số dư quỹ
-- ============================================================
-- Cách tính số dư (TDD Section 2.5):
--   Query 1: opening_balance từ fund_settings
--   Query 2: get_transaction_totals()
--   JS:      balance = opening_balance + total_income - total_expense
-- Lý do tách 2 query thay vì 1 SQL phức tạp:
--   - Đúng tuyệt đối (không còn rủi ro SQL syntax/logic)
--   - Dễ unit test (logic cộng trừ ở JS)
--   - Performance OK (<50ms với index, quy mô <2000 tx/năm)
-- ============================================================

CREATE OR REPLACE FUNCTION get_transaction_totals()
RETURNS TABLE (
  total_income  BIGINT,
  total_expense BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0)::BIGINT AS total_income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::BIGINT AS total_expense
  FROM transactions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- THAM KHẢO NHANH — CÁC QUERY THƯỜNG DÙNG
-- ============================================================

-- [Q1] Tính số dư hiện tại (lib/balance.ts — getCurrentBalance)
-- Step 1: SELECT opening_balance FROM fund_settings LIMIT 1;
-- Step 2: SELECT * FROM get_transaction_totals();
-- Step 3 (JS): balance = opening_balance + total_income - total_expense

-- [Q2] Tổng thu/chi theo tháng (Dashboard — monthSummary)
-- Dùng range thay DATE_TRUNC để tận dụng idx_transactions_date
-- SELECT
--   COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
--   COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
-- FROM transactions
-- WHERE date >= '2026-04-01'::date   -- first day of month
--   AND date <  '2026-05-01'::date;  -- first day of next month (exclusive)

-- [Q3] 10 giao dịch gần nhất (Dashboard — recentTransactions)
-- SELECT t.*, m.name AS member_name_live
-- FROM transactions t
-- LEFT JOIN members m ON m.id = t.member_id
-- ORDER BY t.date DESC, t.created_at DESC
-- LIMIT 10;
-- UI: displayName = member_name_live || member_name_snapshot || 'Thành viên đã xoá'

-- [Q4] Kiểm tra idempotency trước INSERT (POST /api/transactions)
-- SELECT * FROM transactions WHERE idempotency_key = $1;
-- Nếu có kết quả → trả 200 + record cũ, không INSERT mới

-- [Q5] Optimistic concurrency — PUT /api/transactions/[id]
-- UPDATE transactions
-- SET amount = $1, note = $2, ..., updated_at = NOW()
-- WHERE id = $id AND updated_at = $expectedUpdatedAt
-- RETURNING *;
-- Nếu rowCount = 0 → 409 Conflict (record đã bị sửa bởi session khác)

-- [Q6] Xoá member có giao dịch — DELETE /api/members/[id]
-- Step 1: SELECT COUNT(*) FROM transactions WHERE member_id = $id
-- Nếu count > 0 → trả 200 { hasTransactions: true, count: X } → client hỏi confirm
-- Nếu ?force=true → xoá thẳng, transactions.member_id → NULL (ON DELETE SET NULL)


-- ============================================================
-- BẢNG TÓNG QUAN NULL THEO TYPE
-- ============================================================
-- Cột                  | income        | expense
-- ---------------------|---------------|------------------
-- member_id            | Bắt buộc      | NULL
-- member_name_snapshot | Bắt buộc*     | NULL
-- category             | NULL          | Bắt buộc
-- category_custom      | NULL          | Optional (khi category='Khác' thì bắt buộc)
-- match_result         | NULL          | Optional (default 'Không liên quan đến trận')
-- idempotency_key      | Bắt buộc      | Bắt buộc
-- note                 | Optional      | Optional
-- (*) Gán ở API layer khi INSERT — không ở client
-- ============================================================
-- Constraint bổ sung (enforced tại API layer, không phải DB):
--   - date <= todayVN() [Không dùng CURRENT_DATE — server UTC, user VN GMT+7]
--   - Nếu category = 'Khác' → category_custom bắt buộc
--   - idempotency_key phải là UUID v4 hợp lệ do client sinh
-- ============================================================


-- ============================================================
-- TESTING TIP
-- ============================================================
-- Thêm script này vào package.json để test timezone như Vercel:
--   "test:ci": "TZ=UTC vitest run"
-- Nếu test pass ở VN nhưng fail khi TZ=UTC → có bug timezone
-- Xem chi tiết: TDD Section 11 — Timezone Handling
-- ============================================================


-- ============================================================
-- END OF SCHEMA — Mieng Moi Ngon F.C
-- TDD v1.2 | 19/04/2026
-- ============================================================
