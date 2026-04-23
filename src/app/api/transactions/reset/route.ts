import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

/** Xoá toàn bộ giao dịch theo type (income | expense) */
export async function DELETE(req: NextRequest) {
  return withAuth(req, async () => {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json({ error: 'type phải là income hoặc expense' }, { status: 400 })
    }

    const { error, count } = await getSupabaseAdmin()
      .from('transactions')
      .delete({ count: 'exact' })
      .eq('type', type)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ deleted: count ?? 0 })
  })
}
