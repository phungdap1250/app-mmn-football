import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    const { data, error } = await getSupabaseAdmin()
      .from('fund_settings')
      .select('*')
      .limit(1)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    return NextResponse.json({
      id: data.id,
      fundName: data.fund_name,
      openingBalance: data.opening_balance,
      bankName: data.bank_name,
      bankAccount: data.bank_account,
      bankOwner: data.bank_owner,
      publicToken: data.public_token,
      publicUrl: `${appUrl}/quy/${data.public_token}`,
    })
  })
}

export async function PUT(req: NextRequest) {
  return withAuth(req, async () => {
    const body = await req.json()

    const patch: Record<string, unknown> = {}
    if (body.fundName !== undefined)       patch.fund_name = body.fundName
    if (body.openingBalance !== undefined) patch.opening_balance = body.openingBalance
    if (body.bankName !== undefined)       patch.bank_name = body.bankName || null
    if (body.bankAccount !== undefined)    patch.bank_account = body.bankAccount || null
    if (body.bankOwner !== undefined)      patch.bank_owner = body.bankOwner || null

    if (!Object.keys(patch).length)
      return NextResponse.json({ error: 'Không có trường nào cần cập nhật' }, { status: 400 })

    const { data, error } = await getSupabaseAdmin()
      .from('fund_settings')
      .update(patch)
      .eq('id', body.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    return NextResponse.json({
      id: data.id,
      fundName: data.fund_name,
      openingBalance: data.opening_balance,
      bankName: data.bank_name,
      bankAccount: data.bank_account,
      bankOwner: data.bank_owner,
      publicToken: data.public_token,
      publicUrl: `${appUrl}/quy/${data.public_token}`,
    })
  })
}
