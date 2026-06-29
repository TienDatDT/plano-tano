import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const globalForSupabase = globalThis as unknown as {
  supabase: SupabaseClient | undefined
}

/** Dùng cho Auth / Storage / Realtime. Dữ liệu theo schema Prisma vẫn qua `prisma` + DATABASE_URL. */
export function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example).',
    )
  }
  globalForSupabase.supabase ??= createClient(supabaseUrl, supabaseAnonKey)
  return globalForSupabase.supabase
}
