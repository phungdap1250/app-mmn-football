import { createBrowserClient } from '@supabase/ssr'

/** Supabase client cho browser (dùng trong 'use client' components) */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
