import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { CreateMemberInput } from '@/types'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(req, async () => {
    const body: CreateMemberInput = await req.json()
    const { id } = params

    if (!body.name?.trim())
      return NextResponse.json({ error: 'Tên không được để trống' }, { status: 400 })
    if (body.name.length > 50)
      return NextResponse.json({ error: 'Tên tối đa 50 ký tự' }, { status: 400 })

    const { data, error } = await getSupabaseAdmin()
      .from('members')
      .update({
        name: body.name.trim(),
        phone: body.phone?.trim() || null,
        jersey_number: body.jerseyNumber?.trim() || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(req, async () => {
    const { id } = params
    const { searchParams } = new URL(req.url)
    const force = searchParams.get('force') === 'true'

    // Kiểm tra có giao dịch liên quan không
    if (!force) {
      const { count } = await getSupabaseAdmin()
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', id)

      if ((count ?? 0) > 0) {
        return NextResponse.json({ hasTransactions: true, count }, { status: 200 })
      }
    }

    const { error } = await getSupabaseAdmin().from('members').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  })
}
