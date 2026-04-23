/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { todayVN } from '@/lib/date'
import type { CreateTransactionInput } from '@/types'

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const offset = (page - 1) * limit

    let query = getSupabaseAdmin()
      .from('transactions')
      .select('*, members!left(name)', { count: 'exact' })
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type) query = query.eq('type', type)
    if (month && year) {
      const m = month.padStart(2, '0')
      const nextM = String(parseInt(month) === 12 ? 1 : parseInt(month) + 1).padStart(2, '0')
      const nextY = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year)
      query = query.gte('date', `${year}-${m}-01`).lt('date', `${nextY}-${nextM}-01`)
    }

    // Lọc theo khoảng ngày tuỳ chỉnh (dùng cho trang kiểm tra đợt thu)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    if (from) query = query.gte('date', from)
    if (to) query = query.lte('date', to)

    const { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data, total: count ?? 0, page, limit })
  })
}

export async function POST(req: NextRequest) {
  return withAuth(req, async () => {
    const body: CreateTransactionInput = await req.json()

    // Validate
    if (!body.amount || body.amount <= 0)
      return NextResponse.json({ error: 'Số tiền phải lớn hơn 0' }, { status: 400 })
    if (!body.date)
      return NextResponse.json({ error: 'Ngày không hợp lệ' }, { status: 400 })
    if (body.date > todayVN())
      return NextResponse.json({ error: 'Không được nhập ngày trong tương lai' }, { status: 400 })
    if (!body.idempotencyKey)
      return NextResponse.json({ error: 'Thiếu idempotency key' }, { status: 400 })

    if (body.type === 'income') {
      if (!body.memberId)
        return NextResponse.json({ error: 'Vui lòng chọn người nộp' }, { status: 400 })
    } else {
      if (!body.category)
        return NextResponse.json({ error: 'Vui lòng chọn hạng mục' }, { status: 400 })
      if (body.category === 'Khác' && !body.categoryCustom)
        return NextResponse.json({ error: 'Vui lòng nhập tên hạng mục' }, { status: 400 })
    }

    // Idempotency check
    const { data: existing } = await getSupabaseAdmin()
      .from('transactions')
      .select('*')
      .eq('idempotency_key', body.idempotencyKey)
      .maybeSingle()

    if (existing) return NextResponse.json(existing, { status: 200 })

    // Lấy member name snapshot
    let memberNameSnapshot: string | null = null
    if (body.type === 'income' && body.memberId) {
      const { data: member } = await getSupabaseAdmin()
        .from('members')
        .select('name')
        .eq('id', body.memberId)
        .single()

      if (!member)
        return NextResponse.json({ error: 'Thành viên không tồn tại' }, { status: 409 })

      memberNameSnapshot = member.name
    }

    try {
      const { data, error } = await getSupabaseAdmin()
        .from('transactions')
        .insert({
          type: body.type,
          amount: body.amount,
          date: body.date,
          note: body.note ?? null,
          member_id: body.memberId ?? null,
          member_name_snapshot: memberNameSnapshot,
          category: body.category ?? null,
          category_custom: body.categoryCustom ?? null,
          match_result: body.matchResult ?? (body.type === 'expense' ? 'Không liên quan đến trận' : null),
          idempotency_key: body.idempotencyKey,
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json(data, { status: 201 })
    } catch (err: any) {
      // Race condition: UNIQUE violation → trả record cũ
      if (err.code === '23505') {
        const { data: dup } = await getSupabaseAdmin()
          .from('transactions')
          .select('*')
          .eq('idempotency_key', body.idempotencyKey)
          .single()
        return NextResponse.json(dup, { status: 200 })
      }
      // FK violation: member đã bị xoá
      if (err.code === '23503') {
        return NextResponse.json({ error: 'Thành viên không còn tồn tại' }, { status: 409 })
      }
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  })
}
