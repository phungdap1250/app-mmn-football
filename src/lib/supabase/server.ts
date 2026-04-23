import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/** Supabase client cho Server Components và API Routes (dùng anon key + session cookie) */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component không thể set cookie — middleware sẽ xử lý refresh
          }
        },
      },
    }
  )
}
