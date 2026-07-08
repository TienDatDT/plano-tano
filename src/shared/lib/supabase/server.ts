import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Tạo Supabase client cho Server Components, API Routes, Server Actions.
 * Dùng @supabase/ssr — KHÔNG dùng @supabase/auth-helpers-nextjs (deprecated).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll được gọi từ Server Component — có thể bỏ qua
          }
        },
      },
    }
  );
}

/**
 * Tạo Supabase Admin client với Service Role Key.
 * CHỈ dùng server-side cho admin operations (inviteUserByEmail, v.v.)
 */
export async function createSupabaseAdminClient() {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
