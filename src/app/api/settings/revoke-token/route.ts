import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

/** Tạo public token mới — link cũ hết hiệu lực ngay */
export async function POST(req: NextRequest) {
  return withAuth(req, async () => {
    // gen_random_bytes qua RPC hoặc dùng crypto Node.js
    const { randomBytes } = await import('crypto')
    const newToken = randomBytes(16).toString('hex')

    // Lấy id trước (singleton table) rồi update đúng row
    const { data: row } = await getSupabaseAdmin()
      .from('fund_settings')
      .select('id')
      .limit(1)
      .single()

    if (!row) return NextResponse.json({ error: 'Không tìm thấy cài đặt quỹ' }, { status: 404 })

    const { data, error } = await getSupabaseAdmin()
      .from('fund_settings')
      .update({ public_token: newToken })
      .eq('id', row.id)
      .select('public_token')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    return NextResponse.json({
      publicToken: data.public_token,
      publicUrl: `${appUrl}/quy/${data.public_token}`,
    })
  })
}
