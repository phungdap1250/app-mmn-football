/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { currentMonthYearVN, monthRangeVN } from '@/lib/date'
import { getCurrentBalance } from '@/lib/balance'
import type { RecentTransaction } from '@/types'

/** Public dashboard — không cần auth, chỉ cần token hợp lệ */
export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params

  // Xác thực token
  const { data: settings, error } = await getSupabaseAdmin()
    .from('fund_settings')
    .select('id, fund_name, public_token')
    .eq('public_token', token)
    .single()

  if (error || !settings)
    return NextResponse.json({ error: 'Link không hợp lệ hoặc đã hết hạn' }, { status: 404 })

  const { month, year } = currentMonthYearVN()
  const { start, end } = monthRangeVN(month, year)

  const [currentBalance, monthResult, recentResult] = await Promise.all([
    getCurrentBalance(),

    getSupabaseAdmin()
      .from('transactions')
      .select('type, amount')
      .gte('date', start)
      .lt('date', end),

    getSupabaseAdmin()
      .from('transactions')
      .select('id, type, amount, date, note, category, category_custom, member_id, member_name_snapshot, members!left(name)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const txMonth = (monthResult.data ?? []) as { type: string; amount: number }[]
  const totalIncome = txMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = txMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const recentTransactions: RecentTransaction[] = (recentResult.data ?? []).map((t: any) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    date: t.date,
    note: t.note,
    label: t.type === 'income'
      ? (t.members?.name ?? t.member_name_snapshot ?? 'Thành viên đã xoá')
      : (t.category === 'Khác' ? (t.category_custom ?? 'Khác') : t.category),
  }))

  return NextResponse.json({
    fundName: settings.fund_name,
    currentBalance,
    isNegative: currentBalance < 0,
    monthSummary: { month, year, totalIncome, totalExpense },
    recentTransactions,
  })
}
