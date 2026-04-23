import { getSupabaseAdmin } from '@/lib/supabase/admin'

/** Tính số dư quỹ hiện tại = opening_balance + total_income - total_expense */
export async function getCurrentBalance(): Promise<number> {
  // Query 1: lấy opening_balance
  const { data: settings, error: settingsErr } = await getSupabaseAdmin()
    .from('fund_settings')
    .select('opening_balance')
    .limit(1)
    .single()

  if (settingsErr || !settings) return 0

  // Query 2: tổng thu & chi qua stored procedure
  const { data: totals, error: totalsErr } = await getSupabaseAdmin()
    .rpc('get_transaction_totals')
    .single() as { data: { total_income: number; total_expense: number } | null; error: unknown }

  if (totalsErr || !totals) return settings.opening_balance

  const netFlow = (totals.total_income ?? 0) - (totals.total_expense ?? 0)
  return settings.opening_balance + netFlow
}
