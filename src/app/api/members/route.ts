import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { CreateMemberInput } from '@/types'

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    const { data, error } = await getSupabaseAdmin()
      .from('members')
      .select('*')
      .order('name', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  })
}

export async function POST(req: NextRequest) {
  return withAuth(req, async () => {
    const body: CreateMemberInput = await req.json()

    if (!body.name?.trim())
      return NextResponse.json({ error: 'Tên không được để trống' }, { status: 400 })
    if (body.name.length > 50)
      return NextResponse.json({ error: 'Tên tối đa 50 ký tự' }, { status: 400 })

    const { data, error } = await getSupabaseAdmin()
      .from('members')
      .insert({
        name: body.name.trim(),
        phone: body.phone?.trim() || null,
        jersey_number: body.jerseyNumber?.trim() || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  })
}
