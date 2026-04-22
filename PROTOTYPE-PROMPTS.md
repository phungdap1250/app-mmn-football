# Prototype Prompts — F.C Mieng Moi Ngon
> Tối ưu cho **Google Stitch** (https://stitch.withgoogle.com)  
> Mobile-First | Màu chủ đạo: xanh lá + trắng + xám nhạt  
> Mỗi prompt dán vào ô "Describe your screen" trong Stitch

---

## SCREEN 1 — S1: Màn hình Đăng nhập `/login`

### Prompt dán vào Stitch

```
A mobile login screen for a football club fund management app called "FC Mieng Moi Ngon".

White background, vertically centered layout.

At the top: a large green circle with a football emoji inside, centered. Below it, the app name "FC Mieng Moi Ngon" in bold dark text. Below that, a subtitle "Quản lý quỹ thu chi cho đội bóng" in small gray text.

In the middle: a white card with soft shadow. Inside the card, one full-width button with the Google "G" logo on the left and the label "Đăng nhập bằng Google" in the center. Below the button, a small gray note: "Chỉ tài khoản thủ quỹ mới có quyền truy cập."

No navigation bar. No footer. Clean and minimal.
Primary color: green. Mobile screen size.
```

### Variant 2 — Loading state (tạo screen riêng để stitch)
```
Same login screen as before, but the Google login button now shows a loading spinner on the left and the text "Đang đăng nhập..." The button is grayed out and disabled. Everything else stays the same.
```

---

## SCREEN 2 — S2: Dashboard `/`

### Prompt dán vào Stitch

```
A mobile dashboard screen for a football club fund management app.

At the top: a header bar with the app name "FC Mieng Moi Ngon" on the left and a small user avatar with initials "TQ" on the right.

Below the header: a large rounded green card showing the label "Số dư quỹ hiện tại" in small white text and the amount "12.500.000 đ" in large bold white text.

Below the green card: a month selector showing "< Tháng 4 / 2026 >" with left and right arrow buttons. Then two side-by-side summary cards — the left card has a green upward arrow icon, label "Tổng thu", amount "8.000.000 đ" in green. The right card has a red downward arrow icon, label "Tổng chi", amount "3.200.000 đ" in red.

Below that: a section titled "Giao dịch gần nhất" with a list of 5 transaction rows. Each row has a colored circle icon on the left (green for income, red for expense), the payer name or expense category in the middle, the date below the name in small gray text, and the amount on the right in green (income) or red (expense). Income rows show names like "Nguyễn Văn A +100.000 đ", expense rows show "Tiền sân -250.000 đ". A "Xem tất cả →" link at the bottom of the list.

At the very bottom: a fixed navigation bar with 5 tabs — Home (active, green), Thu, Chi, Thành viên, Cài đặt.

A floating green "+" button in the bottom-right corner above the navigation bar.
```

### Variant 2 — Quỹ âm (warning state)
```
Same dashboard screen, but the large balance card is now red instead of green, showing "-500.000 đ" in bold white text. Below the amount, a small white pill badge with "⚠️ Quỹ đang âm". Everything else stays the same.
```

---

## SCREEN 3 — S7: Quản lý Thành viên `/members`

### Prompt dán vào Stitch

```
A mobile member management screen for a football club fund app.

At the top: a header with a back arrow on the left and the title "Thành viên" centered. Below the header: small gray text "14 thành viên".

Below that: a scrollable list of member cards. Each card is a white rounded rectangle with a soft border. On the left of each card: a green circle avatar with the member's initials (2 letters). In the middle: the member's full name in dark bold text on top, and below it either a phone number like "0901234567" or a jersey number like "Số áo: 10" in small gray text. On the right: two small icon buttons — a pencil icon for edit and a trash icon for delete, both in light gray.

Show 8 members with Vietnamese names: Nguyễn Văn An, Trần Minh Đức, Lê Quốc Hùng, Phạm Thành Long, Hoàng Văn Bình, Vũ Đình Khoa, Đặng Quang Huy, Bùi Thanh Tùng. Mix of phone numbers, jersey numbers, and some with no secondary info.

At the bottom above the navigation: a full-width green button labeled "+ Thêm thành viên".

Fixed navigation bar at the very bottom with 5 tabs — Home, Thu, Chi, Thành viên (active, green), Cài đặt.
```

### Variant 2 — Bottom sheet "Thêm thành viên" (S7b)
```
Same member list screen, but with a bottom sheet modal overlaid on the lower half of the screen. The bottom sheet has a gray drag handle at the top, then the title "Thêm thành viên" in bold.

Inside the sheet: three input fields stacked vertically.
- First field labeled "Tên thành viên *" with placeholder "Nhập tên thành viên".
- Second field labeled "Số điện thoại" with placeholder "0901234567 (không bắt buộc)".
- Third field labeled "Số áo" with placeholder "Số áo (không bắt buộc)".

Below the fields: a small tip text in gray "💡 Nên điền Số điện thoại hoặc Số áo để phân biệt khi có 2 người cùng tên."

At the bottom of the sheet: two side-by-side buttons — "Huỷ" (outlined, gray) on the left and "Lưu" (filled, green) on the right. The background behind the sheet is slightly dimmed.
```

---

## Hướng dẫn dùng trong Google Stitch

**Bước 1 — Tạo từng màn hình:**
1. Vào https://stitch.withgoogle.com → New Project
2. Click "+" để thêm screen mới
3. Dán từng prompt vào ô mô tả → Generate
4. Nếu chưa ưng, chỉnh sửa thêm bằng follow-up prompt (vd: "Make the balance card bigger" hoặc "Change the primary color to green #16a34a")

**Bước 2 — Tạo variant screens:**
- Mỗi màn hình nên tạo thêm 1 variant (loading, empty state, warning) để stitch đầy đủ
- Duplicate screen → chỉnh theo Variant prompt bên dưới mỗi màn hình

**Bước 3 — Stitch (kết nối) thành flow:**

```
[S1 Login] ──tap "Đăng nhập bằng Google"──► [S1 Loading]
                                                    │
                                              (auto redirect)
                                                    ▼
                                           [S2 Dashboard]
                                                    │
                                     tap tab "Thành viên"
                                                    ▼
                                        [S7 Members List]
                                                    │
                                   tap "+ Thêm thành viên"
                                                    ▼
                                     [S7b Bottom Sheet Form]
```

**Tip hay khi dùng Stitch:**
- Sau khi generate, dùng "Edit with AI" để tinh chỉnh từng element
- Export ra PNG/PDF để share với team qua Zalo
- Có thể export link preview để mọi người click thử flow trên điện thoại
