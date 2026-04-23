import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase Admin client — Service Role key, bypass RLS hoàn toàn.
 * CHỈ dùng trong API Routes server-side. Lazy-init để tránh lỗi build khi thiếu env.
 * Dùng getSupabaseAdmin() thay vì import trực tiếp.
 */
let _client: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return _client
}
