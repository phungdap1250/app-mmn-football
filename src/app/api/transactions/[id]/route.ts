import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { todayVN } from '@/lib/date'
import type { UpdateTransactionInput } from '@/types'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(_req, async () => {
    const { data, error } = await getSupabaseAdmin()
      .from('transactions')
      .select('*, members!left(name)')
      .eq('id', params.id)
      .single()

    if (error || !data)
      return NextResponse.json({ error: 'Không tìm thấy giao dịch' }, { status: 404 })

    return NextResponse.json(data)
  })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(req, async () => {
    const body: UpdateTransactionInput = await req.json()
    const { id } = params

    if (!body.expectedUpdatedAt)
      return NextResponse.json({ error: 'Thiếu expectedUpdatedAt' }, { status: 400 })
    if (!body.amount || body.amount <= 0)
      return NextResponse.json({ error: 'Số tiền phải lớn hơn 0' }, { status: 400 })
    if (body.date > todayVN())
      return NextResponse.json({ error: 'Không được nhập ngày trong tương lai' }, { status: 400 })

    // Lấy member name snapshot nếu income
    let memberNameSnapshot: string | null = null
    if (body.type === 'income' && body.memberId) {
      const { data: member } = await getSupabaseAdmin()
        .from('members').select('name').eq('id', body.memberId).single()
      if (!member)
        return NextResponse.json({ error: 'Thành viên không tồn tại' }, { status: 409 })
      memberNameSnapshot = member.name
    }

    // Optimistic concurrency: chỉ UPDATE nếu updated_at khớp
    const { data, error } = await getSupabaseAdmin()
      .from('transactions')
      .update({
        type: body.type,
        amount: body.amount,
        date: body.date,
        note: body.note ?? null,
        member_id: body.memberId ?? null,
        member_name_snapshot: memberNameSnapshot,
        category: body.category ?? null,
        category_custom: body.categoryCustom ?? null,
        match_result: body.matchResult ?? null,
      })
      .eq('id', id)
      .eq('updated_at', body.expectedUpdatedAt)
      .select()
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data)
      return NextResponse.json(
        { error: 'Giao dịch đã được sửa trên thiết bị khác. Vui lòng tải lại.' },
        { status: 409 }
      )

    return NextResponse.json(data)
  })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(req, async () => {
    const { id } = params
    const body = await req.json().catch(() => ({}))

    let query = getSupabaseAdmin().from('transactions').delete().eq('id', id)

    // Optimistic concurrency check (optional)
    if (body.expectedUpdatedAt) {
      query = query.eq('updated_at', body.expectedUpdatedAt)
    }

    const { error, count } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (body.expectedUpdatedAt && count === 0)
      return NextResponse.json(
        { error: 'Giao dịch đã được sửa trên thiết bị khác.' },
        { status: 409 }
      )

    return NextResponse.json({ success: true })
  })
}
