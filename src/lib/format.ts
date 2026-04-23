/** Format a number as Vietnamese currency: 1500000 → "1.500.000đ" */
export function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

/** Format a Date as DD/MM/YYYY */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Today's date as YYYY-MM-DD (for input[type=date] max attribute) */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/** Tháng & năm hiện tại theo giờ client (dùng ở client-side UI only) */
export function currentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
