# Screen Inventory — F.C Mieng Moi Ngon
> Dựa trên PRD v1.1 | Sắp xếp theo User Journey | Cập nhật: 16/04/2026

---

## Ký hiệu

| Ký hiệu | Ý nghĩa |
|---|---|
| 🔐 | Chỉ thủ quỹ đã đăng nhập mới thấy |
| 🌐 | Public — ai có link đều xem được, không cần đăng nhập |
| 🔄 | Shared screen — dùng chung layout, thay đổi theo role |
| 📋 | Form / Modal / Bottom sheet — overlay lên màn hình hiện tại |
| ⚠️ | Màn hình trạng thái / lỗi |

---

## Tổng quan: Sơ đồ màn hình

```
[S1 Login]
    │
    ▼
[S2 Dashboard] 🔄 (thủ quỹ xem đầy đủ / public chỉ đọc)
    ├──► [S3 Danh sách Thu]  ──► [S4 Form Thu] ──► [S4b QR Modal]
    ├──► [S5 Danh sách Chi]  ──► [S6 Form Chi]
    ├──► [S7 Quản lý Thành viên] ──► [S7b Form Thành viên]
    └──► [S8 Cài đặt]

[S9 Trang Public] — truy cập qua link chia sẻ, không cần login
[S10 Không có quyền] — tài khoản Google khác cố đăng nhập
```

---

## Chi tiết từng màn hình theo User Journey

---

### S1 — Màn hình Đăng nhập `[/login]` 🔐
> *Màn hình đầu tiên user gặp khi chưa có session.*

**UI Elements:**
- Logo app + Tên app "F.C Mieng Moi Ngon"
- Tagline: "Quản lý quỹ thu chi cho đội bóng"
- Button chính: **"Đăng nhập bằng Google"** (icon Google + text)
- Ghi chú nhỏ: "Chỉ tài khoản thủ quỹ mới có quyền truy cập"
- Loading spinner (hiện khi đang chờ Google OAuth phản hồi)

**Luồng ra:**
- Đăng nhập thành công → S2 Dashboard
- Đăng nhập bằng tài khoản không phải thủ quỹ → S10

---

### S2 — Dashboard `[/]` 🔄 *(Shared — thay đổi theo role)*
> *Màn hình chính sau đăng nhập. Đây cũng là màn hình public nếu truy cập qua link chia sẻ (xem S9).*

**Header (chỉ thủ quỹ):**
- Tên quỹ (lấy từ Cài đặt)
- Avatar Google + Dropdown: tên tài khoản / **Đăng xuất**
- Icon điều hướng đến Cài đặt (⚙️)

**Khu vực số dư:**
- Thẻ lớn: **Số dư quỹ hiện tại** (chữ số to, đơn vị VNĐ)
  - Màu xanh nếu dương / Màu đỏ + badge **"⚠️ Quỹ đang âm"** nếu âm

**Khu vực tóm tắt tháng:**
- Bộ lọc tháng/năm (mặc định tháng hiện tại, có nút ← →)
- Thẻ **Tổng thu** tháng (màu xanh lá)
- Thẻ **Tổng chi** tháng (màu đỏ)

**Danh sách giao dịch gần nhất:**
- Tiêu đề: "10 giao dịch gần nhất"
- Mỗi dòng gồm:
  - Icon loại (↑ Thu màu xanh / ↓ Chi màu đỏ)
  - Tên người nộp (nếu Thu) hoặc Hạng mục (nếu Chi)
  - Số tiền (+ nếu Thu / − nếu Chi)
  - Ngày giao dịch
  - Tag trận (nếu Chi có tag Thắng/Hoà/Thua)
  - *(Chỉ thủ quỹ)* Nút **Sửa** | Nút **Xoá**
- Link "Xem tất cả" → S3 hoặc S5

**Bottom Navigation (Mobile):**
- 🏠 Dashboard | 💰 Thu | 💸 Chi | 👥 Thành viên | ⚙️ Cài đặt

**FAB (Chỉ thủ quỹ):**
- Nút **"+"** mở ra 2 lựa chọn: "+ Thêm thu" | "+ Thêm chi"

---

### S3 — Danh sách Thu `[/income]` 🔐
> *Toàn bộ lịch sử khoản thu. Truy cập từ bottom nav hoặc link "Xem tất cả" trên Dashboard.*

**UI Elements:**
- Header: "Lịch sử Thu" + nút Back
- Bộ lọc tháng/năm (← →)
- Tổng thu của tháng đang lọc (text nhỏ phía trên list)
- Danh sách giao dịch thu — sắp xếp theo ngày giảm dần:
  - Tên người nộp
  - Số tiền (VNĐ)
  - Ngày nộp
  - Lý do (nếu có, hiển thị italic)
  - Nút **Sửa** → S4 (form điền sẵn)
  - Nút **Xoá** → Modal xác nhận xoá
- Trạng thái rỗng: "Chưa có khoản thu nào. Bấm + để thêm."
- FAB hoặc Button **"+ Thêm khoản thu"** → S4

---

### S4 — Form Thêm / Sửa Khoản Thu `[/income/new]` hoặc `[/income/:id/edit]` 🔐 📋
> *Có thể triển khai dạng trang riêng hoặc bottom sheet. Dùng chung cho Thêm mới và Sửa.*

**UI Elements:**
- Header: **"Thêm khoản thu"** / **"Sửa khoản thu"**
- **[Bắt buộc]** Dropdown **Người nộp** — tìm kiếm được trong danh sách thành viên
  - Mỗi option hiển thị: Tên + (Số điện thoại hoặc Số áo nếu có, để tránh nhầm khi trùng tên)
  - Lỗi: "Vui lòng chọn người nộp"
- **[Bắt buộc]** Input số **Số tiền** (type=number, min=1, đơn vị VNĐ)
  - Lỗi: "Vui lòng nhập số tiền" / "Số tiền phải lớn hơn 0"
- **[Bắt buộc]** Datepicker **Ngày nộp** — mặc định hôm nay, disable ngày tương lai
  - Lỗi: "Vui lòng chọn ngày nộp"
- **[Tuỳ chọn]** Textarea **Lý do** — placeholder "vd: Đóng quỹ tháng 4", max 200 ký tự, counter hiển thị
- Button **"Tạo mã QR"** — hiện nếu đã có thông tin ngân hàng trong Cài đặt; mờ + tooltip "Vào Cài đặt để thêm thông tin ngân hàng" nếu chưa điền
- Button **"Lưu"** (disabled cho đến khi tất cả required fields hợp lệ; disabled lại sau khi bấm cho đến khi server phản hồi)
- Button **"Huỷ"** / nút X

**Luồng ra:**
- Lưu thành công → quay lại S3, hiện Toast "✅ Đã thêm khoản thu"
- Bấm "Tạo mã QR" → S4b QR Modal (song song với form, không đóng form)

---

### S4b — Modal QR Chuyển khoản 📋
> *Overlay xuất hiện khi bấm "Tạo mã QR" từ S4. Không phải màn hình riêng.*

**UI Elements:**
- Tiêu đề: "Mã QR chuyển khoản"
- Ảnh mã QR (từ VietQR.io)
- Thông tin tài khoản: Ngân hàng — Số tài khoản — Tên chủ tài khoản — Số tiền — Nội dung chuyển khoản
- Đồng hồ đếm ngược 5 phút (QR tự ẩn sau 5 phút)
- Button **"Đóng"**
- Trạng thái lỗi API: ẩn QR, hiện text "Không tạo được mã QR. Vui lòng chuyển khoản theo thông tin tài khoản bên dưới."

---

### S5 — Danh sách Chi `[/expenses]` 🔐
> *Toàn bộ lịch sử khoản chi. Tương tự S3 nhưng cho chi.*

**UI Elements:**
- Header: "Lịch sử Chi" + nút Back
- Bộ lọc tháng/năm (← →)
- Tổng chi của tháng đang lọc
- Danh sách giao dịch chi — sắp xếp theo ngày giảm dần:
  - Icon hạng mục (⚽ Tiền sân / 💧 Tiền nước / 🏃 Trọng tài / 🎉 Liên hoan / 📌 Khác)
  - Tên hạng mục (nếu "Khác" thì hiện tên tự nhập)
  - Số tiền (VNĐ)
  - Ngày chi
  - Badge kết quả trận: `🏆 Thắng` / `🤝 Hoà` / `😞 Thua` (ẩn nếu là "Không liên quan")
  - Ghi chú (nếu có, italic)
  - Nút **Sửa** → S6
  - Nút **Xoá** → Modal xác nhận xoá
- Trạng thái rỗng: "Chưa có khoản chi nào. Bấm + để thêm."
- FAB hoặc Button **"+ Thêm khoản chi"** → S6

---

### S6 — Form Thêm / Sửa Khoản Chi `[/expenses/new]` hoặc `[/expenses/:id/edit]` 🔐 📋
> *Dùng chung cho Thêm mới và Sửa khoản chi.*

**UI Elements:**
- Header: **"Thêm khoản chi"** / **"Sửa khoản chi"**
- **[Bắt buộc]** Input **Số tiền** (type=number, min=1, đơn vị VNĐ)
  - Lỗi: "Vui lòng nhập số tiền" / "Số tiền phải lớn hơn 0"
- **[Bắt buộc]** Datepicker **Ngày chi** — mặc định hôm nay, disable ngày tương lai
- **[Bắt buộc]** Dropdown **Hạng mục**: Tiền sân / Tiền nước / Trọng tài / Liên hoan / Khác
  - Nếu chọn "Khác": hiện thêm Input text "Tên hạng mục" (max 50 ký tự, bắt buộc khi chọn Khác)
  - Lỗi: "Vui lòng chọn hạng mục"
- **[Tuỳ chọn]** Textarea **Ghi chú** — max 200 ký tự, counter hiển thị
- **[Tuỳ chọn]** Toggle/Chip **Kết quả trận**: `Thắng` | `Hoà` | `Thua` | `Không liên quan` — mặc định chọn "Không liên quan"
- Button **"Lưu"** (disabled cho đến khi required fields hợp lệ; disabled lại sau khi bấm)
- Button **"Huỷ"**

**Luồng ra:**
- Lưu thành công → quay lại S5, hiện Toast "✅ Đã thêm khoản chi"
- Nếu số tiền > số dư hiện tại → hiện Popup cảnh báo "⚠️ Khoản chi này làm quỹ bị âm. Bạn vẫn muốn tiếp tục?" (2 nút: Tiếp tục / Huỷ)

---

### S7 — Quản lý Thành viên `[/members]` 🔐
> *Thường là bước đầu tiên thủ quỹ làm sau khi đăng nhập lần đầu — nhập danh sách đội trước khi nhập thu.*

**UI Elements:**
- Header: "Thành viên" + nút Back
- Tổng số thành viên hiện tại (vd: "14 thành viên")
- Danh sách thành viên — sắp xếp theo tên A-Z hoặc theo thứ tự thêm vào:
  - Avatar chữ cái đầu tên
  - Tên thành viên
  - Số điện thoại (nếu có) hoặc Số áo (nếu có)
  - Nút **Sửa** → S7b (form điền sẵn)
  - Nút **Xoá** → Popup xác nhận (xem Edge Case xoá thành viên có giao dịch)
- Trạng thái rỗng: "Chưa có thành viên. Thêm thành viên trước khi nhập thu quỹ."
- Button **"+ Thêm thành viên"** → S7b

---

### S7b — Form Thêm / Sửa Thành viên 📋
> *Bottom sheet hoặc modal nhỏ. Không cần trang riêng.*

**UI Elements:**
- Header: **"Thêm thành viên"** / **"Sửa thông tin"**
- **[Bắt buộc]** Input **Tên** — max 50 ký tự
  - Lỗi: "Vui lòng nhập tên thành viên"
- **[Tuỳ chọn]** Input **Số điện thoại** — chỉ nhận số, format 10 chữ số
- **[Tuỳ chọn]** Input **Số áo** — chỉ nhận số nguyên dương
- Ghi chú nhỏ: "Nên điền Số điện thoại hoặc Số áo để phân biệt khi có 2 người cùng tên"
- Button **"Lưu"** / **"Cập nhật"**
- Button **"Huỷ"**

---

### S8 — Cài đặt `[/settings]` 🔐
> *Thủ quỹ vào đây lần đầu để: nhập số dư đầu kỳ, điền thông tin ngân hàng, lấy link chia sẻ.*

**UI Elements:**

**Section 1 — Thông tin quỹ:**
- Input **Tên quỹ** — vd: "Quỹ FC Mieng Moi Ngon"
- Input **Số dư đầu kỳ** (type=number, mặc định 0, đơn vị VNĐ)
  - Ghi chú: "Nhập số tiền quỹ đang có trước khi dùng app. Sẽ được cộng vào số dư tổng nhưng không hiện trong danh sách giao dịch."

**Section 2 — Tài khoản ngân hàng (cho VietQR):**
- Dropdown/Autocomplete **Tên ngân hàng** (danh sách ngân hàng VN)
- Input **Số tài khoản**
- Input **Tên chủ tài khoản**
- Ghi chú: "Thông tin này dùng để tạo mã QR khi nhập khoản thu"

**Section 3 — Chia sẻ công khai:**
- Label: "Link xem quỹ (chỉ đọc)"
- Ô hiển thị link hiện tại (readonly, có thể bôi đen copy)
- Button **"📋 Copy link"** → Toast "Đã copy link!"
- Button **"🔄 Tạo link mới"** → Popup xác nhận "Link cũ sẽ hết hiệu lực ngay. Tiếp tục?" → Tạo link mới hiển thị lên

**Section 4 — Tài khoản:**
- Avatar + tên Google account + email
- Button **"Đăng xuất"** → Popup xác nhận → về S1

**Button "Lưu thay đổi"** — sticky ở cuối trang, disabled nếu không có gì thay đổi

---

### S9 — Trang Xem Công Khai `[/public/:token]` 🌐 🔄
> *Ai có link đều vào được. Không cần đăng nhập. Dùng chung layout Dashboard nhưng stripped-down.*

**Khác biệt so với Dashboard thủ quỹ (S2):**
- Không có Avatar / Dropdown tài khoản / nút Đăng xuất
- Không có FAB "+ Thêm thu/chi"
- Không có nút Sửa / Xoá trên từng dòng giao dịch
- Không có link điều hướng đến S3/S5/S7/S8
- Thêm banner nhỏ phía trên: **"👁 Chỉ xem — Trang quỹ công khai của FC Mieng Moi Ngon"**
- Hiển thị đầy đủ: Số dư hiện tại, Tổng thu/chi tháng, 10 giao dịch gần nhất (có thể xem danh sách đầy đủ thu/chi theo chế độ read-only)

**Trạng thái link không hợp lệ / đã bị revoke:**
- Hiện trang: "Link này không còn hiệu lực. Vui lòng xin link mới từ thủ quỹ."

---

### S10 — Màn hình Không có quyền `[/unauthorized]` ⚠️
> *Hiện khi tài khoản Google không phải thủ quỹ cố đăng nhập.*

**UI Elements:**
- Icon khoá 🔒
- Tiêu đề: "Bạn không có quyền truy cập"
- Mô tả: "Chỉ tài khoản thủ quỹ được đăng nhập vào hệ thống. Nếu bạn muốn xem quỹ, hãy xin link xem công khai từ thủ quỹ."
- Button **"Đăng xuất và thử lại"**

---

## Popup / Modal dùng chung (không phải màn hình riêng)

| Modal | Nơi xuất hiện | Nội dung |
|---|---|---|
| Xác nhận xoá giao dịch | S3, S5, S2 | "Bạn có chắc muốn xoá khoản [Thu/Chi] X đồng ngày DD/MM?" — Nút: Xoá (đỏ) / Huỷ |
| Cảnh báo quỹ âm | S6 (khi lưu) | "Khoản chi này làm quỹ bị âm. Bạn vẫn muốn tiếp tục?" — Nút: Tiếp tục / Huỷ |
| Xác nhận xoá thành viên có giao dịch | S7 | "Thành viên này đã có X khoản thu. Xoá thành viên sẽ không xoá các giao dịch đó. Bạn vẫn muốn xoá?" — Nút: Xoá / Huỷ |
| Xác nhận tạo link mới | S8 | "Link cũ sẽ hết hiệu lực ngay lập tức. Bạn có muốn tạo link mới?" — Nút: Tạo mới / Huỷ |
| Xác nhận đăng xuất | S8, S2 | "Bạn có chắc muốn đăng xuất?" — Nút: Đăng xuất / Ở lại |

---

## Toast Notifications (global)

| Loại | Nội dung |
|---|---|
| ✅ Thành công | "Đã thêm khoản thu" / "Đã lưu thay đổi" / "Đã copy link!" / "Đã xoá giao dịch" |
| ❌ Lỗi mạng | "Lỗi kết nối mạng, vui lòng thử lại" |
| ❌ Lỗi server | "Hệ thống đang bận, anh em thử lại sau nhé!" |
| ⚠️ VietQR lỗi | "Không tạo được mã QR, anh em chuyển khoản theo số tài khoản nhé!" |

---

## Tổng kết

| # | Màn hình | Route | Role | Ghi chú |
|---|---|---|---|---|
| S1 | Đăng nhập | `/login` | Public | Entry point |
| S2 | Dashboard | `/` | 🔄 Shared | Command center chính |
| S3 | Danh sách Thu | `/income` | 🔐 Thủ quỹ | Có filter tháng |
| S4 | Form Thu | `/income/new` hoặc `/income/:id/edit` | 🔐 Thủ quỹ | Thêm + Sửa dùng chung |
| S4b | QR Modal | *(overlay trên S4)* | 🔐 Thủ quỹ | Không phải trang riêng |
| S5 | Danh sách Chi | `/expenses` | 🔐 Thủ quỹ | Có filter tháng |
| S6 | Form Chi | `/expenses/new` hoặc `/expenses/:id/edit` | 🔐 Thủ quỹ | Thêm + Sửa dùng chung |
| S7 | Quản lý Thành viên | `/members` | 🔐 Thủ quỹ | Bước đầu tiên khi setup |
| S7b | Form Thành viên | *(bottom sheet trong S7)* | 🔐 Thủ quỹ | Không phải trang riêng |
| S8 | Cài đặt | `/settings` | 🔐 Thủ quỹ | Opening balance + ngân hàng + link |
| S9 | Trang Public | `/public/:token` | 🌐 Public | Dashboard stripped-down |
| S10 | Không có quyền | `/unauthorized` | Public | Tài khoản Google không phải thủ quỹ |

**Tổng: 10 màn hình chính + 2 overlay (S4b, S7b) + 5 popup dùng chung**
