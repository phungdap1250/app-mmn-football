import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

/** Trả về danh sách đợt thu đã có (distinct, sắp xếp mới nhất trước) */
export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    const { data, error } = await getSupabaseAdmin()
      .from('transactions')
      .select('dot_thu')
      .eq('type', 'income')
      .not('dot_thu', 'is', null)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Lấy unique values, giữ thứ tự xuất hiện
    const seen = new Set<string>()
    const list: string[] = []
    for (const row of data ?? []) {
      if (row.dot_thu && !seen.has(row.dot_thu)) {
        seen.add(row.dot_thu)
        list.push(row.dot_thu)
      }
    }

    return NextResponse.json(list)
  })
}
