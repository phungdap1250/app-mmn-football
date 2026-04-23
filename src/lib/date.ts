/**
 * Timezone helpers — nguồn chân lý duy nhất cho mọi thao tác ngày giờ.
 * Server Vercel chạy UTC, user ở VN (GMT+7) → phải dùng helpers này.
 * KHÔNG BAO GIỜ dùng new Date().toISOString() để validate date ở server.
 */

const TZ = 'Asia/Ho_Chi_Minh'

/** Ngày hiện tại theo giờ VN, format YYYY-MM-DD */
export function todayVN(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ })
}

/** Tháng & năm hiện tại theo giờ VN */
export function currentMonthYearVN(): { month: number; year: number } {
  const now = new Date()
  return {
    year: parseInt(now.toLocaleString('en-US', { timeZone: TZ, year: 'numeric' })),
    month: parseInt(now.toLocaleString('en-US', { timeZone: TZ, month: 'numeric' })),
  }
}

/** Format TIMESTAMPTZ sang chuỗi hiển thị giờ VN */
export function formatDateTimeVN(isoString: string): string {
  return new Date(isoString).toLocaleString('vi-VN', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

/** Lấy first day và next-month first day (cho WHERE date >= start AND date < end) */
export function monthRangeVN(month: number, year: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
  return { start, end }
}
