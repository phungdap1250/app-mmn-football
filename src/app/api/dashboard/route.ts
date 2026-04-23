/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getCurrentBalance } from '@/lib/balance'
import type { RecentTransaction } from '@/types'

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    // 3 queries chạy song song — tổng thu/chi tính all-time (không lọc tháng)
    const [currentBalance, settingsResult, allTxResult, recentResult] = await Promise.all([
      getCurrentBalance(),

      getSupabaseAdmin()
        .from('fund_settings')
        .select('fund_name')
        .limit(1)
        .single(),

      getSupabaseAdmin()
        .from('transactions')
        .select('type, amount'),

      getSupabaseAdmin()
        .from('transactions')
        .select('id, type, amount, date, note, category, category_custom, member_id, member_name_snapshot, members!left(name)')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    // Tính tổng thu/chi all-time
    const allTx = (allTxResult.data ?? []) as { type: string; amount: number }[]
    const totalIncome  = allTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = allTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

    // Map 10 giao dịch gần nhất
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
      fundName: settingsResult.data?.fund_name ?? 'Quỹ FC Mieng Moi Ngon',
      currentBalance,
      isNegative: currentBalance < 0,
      summary: { totalIncome, totalExpense },
      recentTransactions,
    })
  })
}
