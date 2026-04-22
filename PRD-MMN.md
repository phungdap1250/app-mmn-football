# PRD — Mieng Moi Ngon F.C

> Mô tả ngắn: app quỹ thu chi cho đội bóng

---

## ① Overview

- **App name:** F.C Mieng Moi Ngon
- **Tagline:** Quản lý quỹ thu chi cho đội bóng 
- **Problem:** đang dùng sheet để quản lý quỹ thu chi, không tiện cho việc theo dõi và quản lý
- **Solution:** Trực quan, minh bạch. Dễ dàng theo dõi và quản lý.
- **Platform:** Web App (Mobile-First, chạy trên trình duyệt — không lên App Store / Google Play)

---

## ② Target User

**Persona chính:**
- Tên / độ tuổi / nghề nghiệp: Đội bóng, <40 tuổi, tự do
- Họ đang làm gì hàng ngày: đá bóng, giao lưu
- Nỗi đau cụ thể: nhập tay trên ghi chú và dễ nhầm lẫn thu chi
- Họ dùng tool nào hiện tại: ghi chú

---

## ③ Features & User Stories

> Mỗi feature gồm: Tên · Story · Done khi

### 📋 Tổng quan User Stories

| ID | Feature | Sprint | Priority | Status |
|---|---|---|---|---|
| US-001 | Cài đặt quỹ & Số dư đầu kỳ | 0 | 🟢 MUST | ✅ Done |
| US-002 | Dashboard | 1 | 🟢 MUST | ✅ Done |
| US-003 | Quản lý thu quỹ + thành viên | 1 | 🟢 MUST | ✅ Done |
| US-004 | Quản lý chi quỹ | 1 | 🟢 MUST | ✅ Done |
| US-005 | Sửa / Xoá giao dịch | 2 | 🟢 MUST | ✅ Done |
| US-006 | Chia sẻ báo cáo công khai | 2 | 🔵 SHOULD | ❌ Dropped |
| US-007 | Kiểm tra đợt thu | 3 | 🟢 MUST | ✅ Done |

---

### 🟢 MUST (bắt buộc có trong MVP)

#### US-001 · Feature 6: Cài đặt quỹ & Số dư đầu kỳ

| ID | Sprint | Status |
|---|---|---|
| US-001 | 0 | ✅ Done |

**Story:** Là thủ quỹ, tôi muốn thiết lập thông tin quỹ và nhập số dư ban đầu, để app phản ánh đúng tình trạng tài chính thực tế từ ngày đầu sử dụng.

**Done khi:**
✅ Có trang **Cài đặt** (Settings) với các mục:
- **Tên quỹ:** tên hiển thị trên Dashboard.
- **Số dư đầu kỳ:** nhập số tiền quỹ đang có trước khi bắt đầu dùng app (mặc định = 0đ). Số này được cộng vào Tổng số dư nhưng **không** xuất hiện như một giao dịch.
✅ Thủ quỹ có thể cập nhật bất cứ lúc nào.
✅ Khi thay đổi Số dư đầu kỳ, Tổng số dư trên Dashboard cập nhật lại ngay lập tức.
❌ Không có màn hình quản lý nhiều đội bóng — 1 tài khoản = 1 quỹ duy nhất.

> **Đã loại bỏ khỏi scope:** Thông tin tài khoản ngân hàng và link chia sẻ công khai — đội dùng Zalo group để chia sẻ ảnh chụp màn hình.

---

#### US-002 · Feature 1: Dashboard

| ID | Sprint | Status |
|---|---|---|
| US-002 | 1 | ✅ Done |

**Story:** Là thủ quỹ, tôi muốn xem tổng quan thu chi, để nắm được tình hình tài chính.

**Done khi:**
- ✅ Hiển thị chính xác **Số dư quỹ hiện tại** (Total Balance) — phản ánh tổng thu trừ tổng chi từ đầu đến hiện tại, bao gồm cả số dư đầu kỳ đã nhập.
- ✅ Hiển thị thẻ tóm tắt **Tổng thu** và **Tổng chi** của **tháng hiện tại** (mặc định). Người dùng có thể chuyển sang xem theo tháng khác bằng bộ lọc tháng/năm.
- ✅ Hiển thị danh sách **10 giao dịch gần nhất** (Recent transactions - ví dụ: đóng quỹ, tiền sân, tiền nước,...). Nếu tổng số giao dịch ít hơn 10 thì hiển thị tất cả. Mỗi dòng gồm: Tên người/hạng mục — Số tiền — Ngày — Loại (Thu/Chi).
- ✅ Khi Số dư quỹ bị âm, hiển thị số đỏ và badge cảnh báo "Quỹ đang âm" trên Dashboard.
- ❌ Không làm biểu đồ cột/đường so sánh Thu - Chi theo tháng trong MVP (chuyển xuống NICE TO HAVE).
- ❌ Không làm tính năng xuất báo cáo quỹ ra file Excel/PDF trong phiên bản MVP này.
- ❌ Không phân tích thành biểu đồ chi tiết cho từng loại danh mục nhỏ (vd: so sánh riêng tiền thuê sân và tiền nước) - để dành làm sau.

---

#### US-003 · Feature 2: Quản lý thu quỹ + thành viên

| ID | Sprint | Status |
|---|---|---|
| US-003 | 1 | ✅ Done |

**Story:** Là thủ quỹ, tôi muốn thêm khoản thu và thành viên đội, để theo dõi thu quỹ và thêm bớt thành viên.

**Done khi:**
✅ Có màn hình danh sách thành viên để dễ dàng Thêm / Cập nhật / Xoá thành viên.
- Thêm thành viên: bắt buộc nhập **Tên** (tối đa 50 ký tự). Tuỳ chọn: **Số áo** để phân biệt khi trùng tên.
- Mỗi thẻ thành viên hiển thị 1 dòng: **Tên · #Số áo** + badge **Đã đóng / Chưa đóng** tháng hiện tại (tính từ giao dịch thu thực tế). Dùng để chụp màn hình gửi nhóm Zalo.
- Cập nhật: chỉnh sửa thông tin thành viên đã có, lưu xong thấy thay đổi ngay trong danh sách.
- Xoá thành viên: nếu thành viên **đã có giao dịch thu liên quan**, hệ thống hiện cảnh báo "Thành viên này đã có X khoản thu. Xoá thành viên sẽ **không xoá các giao dịch đó** — các dòng giao dịch sẽ hiển thị tên cũ. Bạn vẫn muốn xoá?" và chờ xác nhận. Nếu thành viên chưa có giao dịch nào, xoá trực tiếp không cần hỏi lại.

✅ Có thể tạo một khoản thu mới với các thông tin:
- **[Bắt buộc]** Chọn người nộp từ danh sách thành viên.
- **[Bắt buộc]** Số tiền — chỉ nhận số nguyên dương > 0, đơn vị VNĐ.
- **[Bắt buộc]** Ngày nộp — mặc định là ngày hôm nay, không cho phép chọn ngày trong tương lai.
- **[Tuỳ chọn]** Lý do — ô ghi chú tự do (vd: "Đóng quỹ tháng 4"), tối đa 200 ký tự.

✅ Ngay khi khoản thu được lưu, "Số dư quỹ hiện tại" và "Tổng thu" phải tự động được cộng thêm (< 1s).
✅ Nút "Lưu" bị vô hiệu hoá (disabled) ngay sau lần bấm đầu tiên cho đến khi server phản hồi — tránh double-submit.
✅ Khi bấm Lưu thiếu trường bắt buộc: nút Save bị xám, hiện dòng chữ đỏ ngay dưới ô bị thiếu, ghi rõ trường nào thiếu.
❌ Không làm tính năng nhắc nợ tự động (ví dụ: tự động gửi SMS/Zalo cho người chưa đóng quỹ).
❌ Không làm tính năng Import danh sách thành viên hàng loạt từ file Excel (phải nhập tay từng người cho bản MVP).

---

#### US-004 · Feature 3: Quản lý chi quỹ

| ID | Sprint | Status |
|---|---|---|
| US-004 | 1 | ✅ Done |

**Story:** Là thủ quỹ, tôi muốn thêm khoản chi cho các trận đấu thắng, hoà, thua và chi phí khác khi phát sinh.

**Done khi:**
✅ Có thể tạo một khoản chi mới với các thông tin:
- **[Bắt buộc]** Số tiền — chỉ nhận số nguyên dương > 0, đơn vị VNĐ.
- **[Bắt buộc]** Ngày chi — mặc định là ngày hôm nay, không cho phép chọn ngày trong tương lai.
- **[Bắt buộc]** Hạng mục — chọn từ danh sách dropdown cố định: `Tiền sân` / `Tiền nước` / `Trọng tài` / `Liên hoan` / `Khác`. Nếu chọn "Khác" thì hiện thêm ô nhập tên hạng mục tự do (tối đa 50 ký tự). *(Lý do dùng dropdown thay vì free text: tránh dữ liệu bị nhiễu khi người gõ "Tiền sân" vs "tiền sân" vs "san bong".)*
- **[Tuỳ chọn]** Ghi chú — ô văn bản tự do, tối đa 200 ký tự.
- **[Tuỳ chọn]** Tag kết quả trận đấu: `Thắng` / `Hoà` / `Thua` / `Không liên quan đến trận`. Mặc định là "Không liên quan đến trận" — dành cho các khoản chi phát sinh ngoài trận (vd: mua bóng, nước uống ngày thường).

✅ Ngay khi khoản chi được lưu, "Số dư quỹ hiện tại" bị trừ đi và "Tổng chi" được cộng thêm (< 1s).
✅ Nút "Lưu" bị vô hiệu hoá (disabled) ngay sau lần bấm đầu tiên — tránh double-submit.
✅ Lịch sử chi quỹ hiển thị trên một màn hình riêng (tab hoặc trang /expenses), danh sách sắp xếp theo ngày giảm dần (mới nhất lên đầu). Mỗi dòng gồm: Hạng mục — Số tiền — Ngày — Tag trận — Ghi chú.
❌ Không làm tính năng tải lên hình ảnh biên lai / bill chuyển khoản (để tiết kiệm chi phí server cho MVP, chỉ cần ghi chú văn bản chứng từ).
❌ Không làm luồng phê duyệt (Approval workflow - vd: Thủ quỹ nhập xong phải chờ Đội trưởng bấm duyệt thì mới được trừ tiền). Trong MVP, thủ quỹ nhập là hệ thống ghi nhận luôn.

---

#### US-005 · Feature 5: Sửa / Xoá giao dịch

| ID | Sprint | Status |
|---|---|---|
| US-005 | 2 | ✅ Done |

**Story:** Là thủ quỹ, tôi muốn sửa hoặc xoá khoản thu/chi đã nhập sai, để dữ liệu quỹ luôn chính xác.

**Done khi:**
✅ Trong danh sách giao dịch (cả thu và chi), mỗi dòng có nút **Sửa** và nút **Xoá**.
✅ Bấm **Sửa**: mở lại form đã điền sẵn thông tin cũ — thủ quỹ chỉnh sửa rồi bấm "Cập nhật". Hệ thống tính lại Số dư ngay lập tức.
✅ Bấm **Xoá**: hiện Popup xác nhận "Bạn có chắc muốn xoá khoản [Thu/Chi] X đồng ngày DD/MM không?" — bấm "Xoá" thì giao dịch bị xoá, Số dư tự động được tính lại. Bấm "Huỷ" thì không làm gì.
✅ Chỉ thủ quỹ (user đã đăng nhập) mới thấy nút Sửa/Xoá. Người xem qua link public không thấy các nút này.
❌ Không lưu lịch sử chỉnh sửa (Audit Log) — trong MVP, xoá là xoá vĩnh viễn, không có tính năng khôi phục (Undo).

---

---

#### US-007 · Feature 7: Kiểm tra đợt thu

| ID | Sprint | Status |
|---|---|---|
| US-007 | 3 | ✅ Done |

**Story:** Là thủ quỹ, tôi muốn biết trong đợt thu hiện tại ai đã nộp và ai chưa nộp, để theo dõi mà không bị nhầm với các đợt trước.

**Context:** Đội thu tiền theo đợt (không cố định tháng). Hết đợt lại đóng tiếp. Thừa/thiếu thì thủ quỹ tự điều chỉnh `Số dư đầu kỳ` sang đợt mới.

**Done khi:**
✅ Có trang **/kiem-tra-dot** truy cập từ nút "Kiểm tra đợt thu" trên trang Thu quỹ.
✅ Thủ quỹ chọn **khoảng ngày** (từ ngày / đến ngày) tương ứng với đợt thu.
✅ App hiển thị 2 danh sách rõ ràng:
- **Đã nộp:** tên + tổng số tiền đã nộp trong khoảng ngày đó (nếu nộp nhiều lần, cộng gộp và hiện số lần).
- **Chưa nộp:** danh sách thành viên chưa có giao dịch thu nào trong khoảng ngày đó.
✅ Hiển thị tóm tắt X/tổng đã nộp.
✅ Khoảng ngày được **lưu vào localStorage** — mở lại trang vẫn nhớ đợt đang theo dõi.
✅ Tab **Thành viên** đồng bộ badge Đã đóng/Chưa đóng theo cùng khoảng ngày đó (không còn cộng dồn cả tháng).
❌ Không lưu lịch sử các đợt — chỉ theo dõi 1 đợt hiện tại, đổi ngày là xem đợt khác.
❌ Không tự động tính thừa/thiếu — thủ quỹ tự điều chỉnh số dư đầu kỳ khi sang đợt mới.

---

### 🔵 SHOULD (nên có, không gấp)

#### US-006 · Feature 4: Chia sẻ báo cáo công khai

| ID | Sprint | Status |
|---|---|---|
| US-006 | 2 | ❌ Dropped |

> **Lý do Dropped:** Đội quyết định dùng cách đơn giản hơn — thủ quỹ **chụp màn hình tab Thành viên** (hiển thị trạng thái Đã đóng / Chưa đóng của từng người) rồi gửi vào nhóm Zalo. Không cần link public phức tạp.

---

### 🟠 NICE TO HAVE (sau này thêm)
- Theo dõi Công nợ cá nhân — Quản lý chi tiết từng thành viên (Ai đang đóng dư ra mấy tháng, ai đang nợ quỹ bao nhiêu tiền).
- Tích hợp VietQR nhận diện tự động — Thành viên quét mã QR chuyển khoản, hệ thống kết nối ngân hàng tự động nhận biết ai vừa chuyển và "gạch nợ" mà thủ quỹ không cần nhập tay.
- Bot báo cáo Zalo/Telegram — Cuối tháng bot tự động tổng hợp số dư và nhắn tin báo cáo vào group chat của đội.

---

## ④ Tech Stack

| Layer | Tech | Lý do chọn |
|---|---|---|
| Frontend | Next.js (React) + Tailwind CSS | Lên giao diện siêu nhanh, có nhiều template đẹp, UI hiển thị cực tốt và mượt trên màn hình điện thoại (Responsive).|
| Backend | Tích hợp luôn trong Next.js (API Routes) | Đỡ phải code một cục Backend riêng lẻ, tiết kiệm thời gian Server setup và quản lý source code (Monorepo). |
| Database | Supabase (PostgreSQL) | Cơ sở dữ liệu quan hệ (Relational) cực kỳ phù hợp để lưu trữ tiền bạc (giao dịch, cân bằng thu chi). Gói miễn phí của Supabase quá đủ dùng. |
| Auth | Supabase Auth (hoặc NextAuth) | Đi kèm luôn với Database. Hỗ trợ đăng nhập nhanh bằng Gmail/Google, anh em trong đội đỡ phải nhớ mật khẩu lằng nhằng. |
| Hosting | Vercel | Triển khai (Deploy) chỉ bằng 1 nút bấm. Hoàn toàn miễn phí cho dự án nhỏ, tốc độ tải trang cực kỳ nhanh. |

---

## ⑤ Integration Points

> Trong app này, đối với bản MVP chúng ta không cần kết nối các hệ thống quá phức tạp. Chủ yếu là Đăng nhập và tạo mã QR ngân hàng để anh em dễ chuyển khoản.

### 1. Đăng nhập Google (Google OAuth qua Supabase)

**Luồng đăng nhập:**
- Người dùng truy cập app → thấy màn hình Login với nút "Đăng nhập bằng Google".
- Bấm nút → hệ thống gọi Supabase để mở popup chọn tài khoản Google.
- Google trả về token → Supabase xác thực → lưu phiên đăng nhập (Session/Cookie tự động).
- Nếu đây là lần đầu đăng nhập: tự động tạo profile mới trong Database.
- Sau khi đăng nhập thành công: **redirect về trang Dashboard**.

**Luồng đăng xuất:**
- Thủ quỹ bấm vào avatar/tên tài khoản ở góc màn hình → chọn "Đăng xuất".
- Hệ thống gọi `supabase.auth.signOut()` → xoá session → redirect về màn hình Login.

**Kiểm soát truy cập:**
- Chỉ tài khoản Google đã được thủ quỹ chấp nhận (tức là tài khoản của chính thủ quỹ) mới có quyền thao tác dữ liệu. Bất kỳ tài khoản Google khác đăng nhập vào sẽ thấy màn hình "Bạn không có quyền truy cập vào quỹ này."

❌ Không xử lý: Đăng nhập bằng Facebook, Apple ID hay Email/Mật khẩu.
❌ Không xử lý: Trường hợp tài khoản Google bị suspend — người dùng đơn giản không đăng nhập được, hệ thống không cần xử lý gì thêm.

---

### 2. Tạo mã QR Ngân hàng

> **Đã loại bỏ khỏi scope.** Đội ghim mã QR cố định vào nhóm Zalo — không cần tích hợp VietQR trong app.

---

## ⑥ Non-Functional Requirements

- **Performance:** App phải load xong giao diện ban đầu dưới 2s. Sau khi bấm nút "Lưu khoản thu/chi" thì cập nhật ngay lập tức vào số dư tổng (< 1s).
- **Security:** Mọi API thao tác liên quan đến tiền (Thêm/Sửa/Xoá giao dịch) bắt buộc phải kiểm tra quyền (Role) là "Thủ quỹ" (Dùng RLS của Supabase để kiểm soát). Toàn trang chạy https.
- **Responsive:** Bắt buộc thiết kế theo chuẩn Mobile-First (Giao diện ưu tiên tối ưu cho màn hình dọc của điện thoại), vì anh em thường check tiền ngay tại sân banh. Lên Desktop/Laptop vẫn xem được nhưng dạng một vùng căn giữa.
- **Concurrency:** < 50 users cùng lúc (rất nhẹ, Vercel/Supabase gói miễn phí cân cực kỳ dư sức).
- **Uptime:** Chạy trên Vercel nên Uptime luôn đạt chuẩn 99.9%, không lo server "chết" đúng hôm đi đá.

---

## ⑦ Edge Cases & Error States

> Ghi những tình huống bất thường.

| Tình huống | Hành vi mong muốn |
|---|---|
| User nhập sai form | Cấm bấm nút Save (nút bị xám đi). Hiện dòng chữ đỏ dưới từng ô bị thiếu/sai. (vd: "Vui lòng nhập số tiền"). |
| Mất mạng giữa chừng | Đang bấm Lưu mà mất 4G: hiện Toast "Lỗi kết nối mạng, vui lòng thử lại". Dữ liệu đang gõ **không bị mất**. |
| Session hết hạn | Đang mở tab, Supabase hết hạn login: redirect về màn hình Đăng nhập. Sau khi đăng nhập lại, quay về trang vừa dở. |
| Lỗi API Supabase sập | Hiện Toast: "Hệ thống đang bận, anh em thử lại sau nhé!". Không mất dữ liệu đang gõ. |
| Quỹ bị ÂM tiền | Khi khoản chi lớn hơn số dư (vd: Quỹ còn 100k mà chi 500k): app vẫn cho lưu, nhưng hiện Popup cảnh báo: "Khoản chi này làm quỹ bị âm. Bạn vẫn muốn tiếp tục?" — vì thực tế thủ quỹ thường ứng tiền túi ra trả trước. |
| Double-submit | Bấm "Lưu" 2 lần nhanh do mạng chậm: nút bị disabled ngay sau lần bấm đầu, chỉ 1 giao dịch được tạo. |
| Nhập số tiền = 0 hoặc âm | Validation chặn ngay tại form: "Số tiền phải lớn hơn 0". Không gửi lên server. |
| Nhập số tiền không phải số | Trường số tiền chỉ nhận ký tự số (input type=number), tự động bỏ qua ký tự chữ. |
| Chọn ngày trong tương lai | Datepicker không cho chọn ngày lớn hơn hôm nay — disable các ngày tương lai trên lịch. |
| Xoá thành viên đã có giao dịch | Hiện cảnh báo rõ ràng (xem Feature 2). Các giao dịch cũ vẫn giữ nguyên, hiển thị tên cũ. |
| Trùng tên thành viên | Hệ thống cho phép tạo 2 thành viên cùng tên — phân biệt bằng Số điện thoại hoặc Số áo. Khi chọn trong dropdown hiển thị kèm thông tin phụ để tránh nhầm. |

---

## ⑧ Success Metrics

> Sau bao lâu? Đo thế nào?

- **Tuần 1:** Deploy thành công lên mạng. Nhập thành công 100% danh sách anh em trong đội và chốt xong số dư đầu kỳ.
- **Tháng 1:** 100% các khoản thu/chi của tháng đều được ghi nhận qua App, từ bỏ hoàn toàn việc dùng Note/Sheet.
- **Tháng 3:** Ít nhất 50% thành viên trong đội biết cách tự bấm vào link Public để xem quỹ thay vì nhắn tin hỏi thủ quỹ: "Quỹ mình còn bao tiền thế mày?".

---

## ⑨ Constraints & Assumptions

**Giới hạn:**
- Budget: 0 đồng (Chỉ tận dụng các dịch vụ Free Tier của Vercel, Supabase).
- Timeline: Code và hoàn thiện MVP trong vòng 4-5 tiếng.
- Team size: 1 người (tôi).
- Tech constraints: Không public lên App Store / Google Play (vì tốn phí duy trì tài khoản dev). Chỉ dùng dưới dạng Web App chạy trên trình duyệt là đủ.

**Assumptions (giả định):**

*Về người dùng:*
- 100% thành viên đều xài Zalo/Messenger để nhận link xem báo cáo public.
- Thủ quỹ là **người duy nhất** có quyền đăng nhập và thao tác dữ liệu — không có cơ chế "Phó thủ quỹ" hay phân quyền nhiều người.
- Thành viên trong đội **không có tài khoản** trong hệ thống — họ chỉ tồn tại dưới dạng tên trong danh sách, không đăng nhập vào app.
- Khi thủ quỹ thay đổi (chuyển giao), người mới sẽ **đăng nhập bằng tài khoản Google của thủ quỹ cũ** hoặc thủ quỹ cũ tạo tài khoản mới và migrate dữ liệu thủ công — MVP không hỗ trợ chuyển giao tự động.

*Về dữ liệu:*
- Đơn vị tiền tệ duy nhất là **VNĐ** — không có ngoại tệ.
- **Số dư đầu kỳ mặc định = 0đ** khi tạo quỹ lần đầu. Thủ quỹ phải vào Cài đặt để nhập số dư thực tế nếu quỹ đang có sẵn tiền.
- **1 tài khoản = 1 quỹ = 1 đội bóng** — không có khái niệm multi-team.
- Tên thành viên **có thể trùng nhau** — phân biệt bằng Số điện thoại hoặc Số áo.
- Khi xoá giao dịch, dữ liệu bị **xoá vĩnh viễn (hard delete)** — không có tính năng khôi phục hay lịch sử chỉnh sửa (Audit Log) trong MVP.
- Tất cả giao dịch được ghi nhận ngay lập tức, **không có trạng thái "Pending"** hay quy trình phê duyệt.
- Không có khái niệm "mùa giải" hay "kỳ" — toàn bộ là một quỹ liên tục từ đầu đến cuối. Bộ lọc chỉ theo tháng/năm.

---

## Changelog

| Ngày | Thay đổi | Người cập nhật |
|---|---|---|
| 16/04/2026 | v1 — Hoàn thiện draft đầu tiên (tập trung MVP và Tech Stack) | Thủ quỹ |
| 16/04/2026 | v1.1 — Review và cập nhật: sửa Platform, làm rõ AC Feature 1-4, thêm Feature 5 (Edit/Delete giao dịch) và Feature 6 (Cài đặt & Số dư đầu kỳ), bổ sung luồng Integration đầy đủ, thêm Edge Cases, bổ sung Assumptions | Thủ quỹ |
| 22/04/2026 | v1.2 — MVP hoàn thành. Cập nhật trạng thái US-001→005 thành Done. Dropped US-006 (public link) và tích hợp VietQR/QR code — đội dùng Zalo + chụp màn hình. Loại bỏ trường SĐT khỏi thành viên. Thêm badge Đã đóng/Chưa đóng trên tab Thành viên. | Thủ quỹ |
