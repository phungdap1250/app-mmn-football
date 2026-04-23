import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** Lấy session hiện tại từ cookie (server-side) */
export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * withAuth — wrapper cho API Routes.
 * Kiểm tra session + email thủ quỹ trước khi chạy handler.
 * Trả về 401 nếu chưa đăng nhập, 403 nếu sai email.
 */
export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, email: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const allowed = (process.env.TREASURER_EMAIL ?? '').split(',').map(e => e.trim())
  if (!allowed.includes(session.user.email!)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return handler(req, session.user.email!)
}
