import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** Supabase Auth OAuth callback — đổi code lấy session, set cookie vào redirect response */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const returnUrl = searchParams.get('returnUrl') ?? '/dashboard'

  if (code) {
    // Tạo response redirect trước để set cookies trực tiếp lên đó
    // (dùng createClient() từ next/headers sẽ mất cookies khi redirect)
    const response = NextResponse.redirect(`${origin}${returnUrl}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)
    return response
  }

  return NextResponse.redirect(`${origin}/login`)
}
