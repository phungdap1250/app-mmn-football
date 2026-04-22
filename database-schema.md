# Database Schema — F.C Mieng Moi Ngon

> Phiên bản: v1.0 — MVP  
> Stack: Supabase (PostgreSQL)  
> Ngày thiết kế: 19/04/2026

---

## 1. Danh sách Entities (Bảng)

| Tên bảng | Vai trò |
|---|---|
| `profiles` | Thông tin thủ quỹ (mở rộng từ Supabase Auth) |
| `fund_settings` | Cấu hình quỹ: tên, số dư đầu kỳ, tài khoản ngân hàng, link public |
| `members` | Danh sách thành viên đội bóng |
| `transactions` | Toàn bộ giao dịch thu + chi |

---

## 2. Chi tiết từng bảng

---

### Bảng 1: `profiles`

> Lý do tồn tại: Supabase tự quản lý bảng `auth.users` nội bộ — ta không được sửa trực tiếp. Vì vậy phải tạo bảng `profiles` riêng để lưu thêm thông tin hiển thị của thủ quỹ (tên, ảnh đại diện).

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, FK → auth.users(id) | Khóa chính, liên kết 1-1 với tài khoản Google |
| `email` | TEXT | NOT NULL | Email Google của thủ quỹ |
| `full_name` | TEXT | | Tên hiển thị lấy từ Google |
| `avatar_url` | TEXT | | Ảnh đại diện từ Google |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Thời điểm tạo profile |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Lần cập nhật gần nhất |

---

### Bảng 2: `fund_settings`

> Lý do tồn tại: PRD quy định 1 tài khoản = 1 quỹ duy nhất. Bảng này lưu toàn bộ cấu hình của quỹ đó — tên quỹ, số tiền có sẵn trước khi dùng app (opening_balance), thông tin bank để tạo QR, và token bí mật cho link chia sẻ công khai.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Định danh duy nhất của quỹ |
| `user_id` | UUID | NOT NULL, UNIQUE, FK → profiles(id) | Liên kết đến thủ quỹ (1 user = 1 quỹ) |
| `fund_name` | TEXT | NOT NULL, DEFAULT 'Quỹ FC Mieng Moi Ngon' | Tên quỹ hiển thị |
| `opening_balance` | BIGINT | NOT NULL, DEFAULT 0, CHECK >= 0 | Số dư đầu kỳ (VNĐ). Không phải giao dịch, được cộng thẳng vào tổng số dư |
| `bank_name` | TEXT | | Tên ngân hàng (vd: "Vietcombank") |
| `bank_account_number` | TEXT | | Số tài khoản ngân hàng |
| `bank_account_name` | TEXT | | Tên chủ tài khoản |
| `public_token` | TEXT | UNIQUE, DEFAULT hex ngẫu nhiên | Token bí mật tạo link chia sẻ. Khi "Thu hồi link" → tạo token mới, link cũ chết |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Tại sao `opening_balance` là BIGINT không phải NUMERIC?**  
Vì tiền VNĐ không có số lẻ thập phân. BIGINT đủ chứa tới ~9 triệu tỷ đồng — không bao giờ overflow. Tránh dùng FLOAT vì floating-point error khi tính tiền là thảm hoạ.

---

### Bảng 3: `members`

> Lý do tồn tại: Thành viên không phải user — họ không đăng nhập. Họ chỉ là tên trong danh sách để thủ quỹ chọn khi ghi khoản thu. PRD cho phép trùng tên, phân biệt bằng SĐT hoặc số áo.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | |
| `fund_id` | UUID | NOT NULL, FK → fund_settings(id) | Thành viên thuộc quỹ nào |
| `name` | TEXT | NOT NULL, CHECK length <= 50 | Tên thành viên (bắt buộc) |
| `phone` | TEXT | | Số điện thoại (tuỳ chọn, để phân biệt khi trùng tên) |
| `jersey_number` | TEXT | | Số áo (tuỳ chọn, vd: "10", "99") |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Tại sao `jersey_number` là TEXT không phải INTEGER?**  
Số áo không bao giờ dùng để tính toán. Có thể có số áo "007", "99A"... TEXT linh hoạt hơn, tránh bug bất ngờ.

---

### Bảng 4: `transactions`

> Lý do tồn tại: Đây là trái tim của app. Lý do dùng 1 bảng chung thay vì tách 2 bảng riêng (incomes / expenses): giúp truy vấn "10 giao dịch gần nhất" cực đơn giản (1 câu SELECT), tính tổng số dư cũng chỉ 1 query. Các cột dành riêng cho từng loại sẽ để NULL nếu không áp dụng — đây là mô hình Single Table Inheritance, chấp nhận được khi số loại ít (2 loại) và MVP nhỏ.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | |
| `fund_id` | UUID | NOT NULL, FK → fund_settings(id) | Giao dịch thuộc quỹ nào |
| `type` | TEXT | NOT NULL, CHECK IN ('income','expense') | Loại giao dịch: thu hay chi |
| `amount` | BIGINT | NOT NULL, CHECK > 0 | Số tiền (VNĐ, luôn dương) |
| `transaction_date` | DATE | NOT NULL | Ngày giao dịch (không dùng TIMESTAMP vì chỉ cần ngày) |
| **--- Cột riêng cho Thu (income) ---** | | | |
| `member_id` | UUID | FK → members(id) ON DELETE SET NULL | ID thành viên nộp tiền. NULL nếu thành viên bị xoá |
| `member_name` | TEXT | | **Snapshot** tên thành viên tại thời điểm tạo giao dịch. Khi member bị xoá, hiển thị cột này |
| `reason` | TEXT | CHECK length <= 200 | Lý do nộp (vd: "Đóng quỹ tháng 4") |
| **--- Cột riêng cho Chi (expense) ---** | | | |
| `category` | TEXT | CHECK IN ('Tiền sân','Tiền nước','Trọng tài','Liên hoan','Khác') | Hạng mục chi |
| `custom_category` | TEXT | CHECK length <= 50 | Tên hạng mục tự nhập khi category = 'Khác' |
| `notes` | TEXT | CHECK length <= 200 | Ghi chú tự do |
| `match_result` | TEXT | DEFAULT 'Không liên quan đến trận', CHECK IN (4 giá trị) | Tag kết quả trận đấu |
| **--- Metadata ---** | | | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Tại sao có `member_name` (snapshot) bên cạnh `member_id`?**  
PRD nói rõ: khi xoá thành viên, giao dịch cũ vẫn "hiển thị tên cũ". Nếu chỉ lưu `member_id` và sau đó bị SET NULL — ta mất tên. Snapshot giải quyết triệt để: lưu tên ngay lúc tạo giao dịch, dùng cột này để hiển thị, dùng `member_id` để join khi member còn tồn tại.

---

## 3. Quan hệ giữa các bảng (ERD dạng văn bản)

```
auth.users (Supabase)
    │ 1
    │ ON DELETE CASCADE
    ▼ 1
profiles
    │ 1
    │ ON DELETE CASCADE
    ▼ 1
fund_settings
    │ 1
    ├──────────────────────────────────────────────────────────┐
    │ ON DELETE CASCADE                                         │ ON DELETE CASCADE
    ▼ N                                                         ▼ N
members                                                    transactions
    │ 1                                                         ▲
    └──────────────────────────────────────────────────────────┘
      member_id FK (ON DELETE SET NULL) + member_name snapshot
```

**Tóm tắt quan hệ:**
- `auth.users` → `profiles`: 1-1 (1 tài khoản = 1 profile)
- `profiles` → `fund_settings`: 1-1 (1 người = 1 quỹ)
- `fund_settings` → `members`: 1-N (1 quỹ có nhiều thành viên)
- `fund_settings` → `transactions`: 1-N (1 quỹ có nhiều giao dịch)
- `members` → `transactions`: 1-N (1 thành viên trong nhiều khoản thu), với ON DELETE SET NULL

---

## 4. Tính toán Số dư — không lưu cột, tính live

```sql
-- Số dư hiện tại = Số dư đầu kỳ + Tổng thu - Tổng chi
SELECT
  fs.opening_balance
  + COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0)
  - COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0)
  AS current_balance
FROM fund_settings fs
LEFT JOIN transactions t ON t.fund_id = fs.id
WHERE fs.id = :fund_id
GROUP BY fs.opening_balance;
```

**Tại sao không lưu `current_balance` như một cột?** Vì nếu thủ quỹ Sửa hoặc Xoá giao dịch cũ, ta phải nhớ cập nhật lại cột đó — rất dễ bị out-of-sync. Tính trực tiếp từ giao dịch luôn chính xác 100%, và với < 50 users, performance hoàn toàn ổn.

---

## 5. Chiến lược RLS (Row Level Security)

Supabase RLS bảo vệ dữ liệu ngay tại tầng database — dù ai đó có được API key cũng không đọc được dữ liệu người khác.

| Bảng | Thủ quỹ (đã đăng nhập) | Người xem public (có token) |
|---|---|---|
| `profiles` | SELECT/UPDATE chính mình | ❌ |
| `fund_settings` | SELECT/UPDATE chính mình | SELECT (WHERE public_token = ?) |
| `members` | SELECT/INSERT/UPDATE/DELETE quỹ của mình | SELECT (via fund lookup) |
| `transactions` | SELECT/INSERT/UPDATE/DELETE quỹ của mình | SELECT (via fund lookup) |

---
