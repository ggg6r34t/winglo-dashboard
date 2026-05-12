import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component — cannot set cookies; fine for read-only
        }
      },
    },
  })
}

export async function createServiceClient() {
  const cookieStore = await cookies()

  return createServerClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
  })
}

// createOrgScopedClient creates a service client with org context set for RLS enforcement.
// Requires the set_org_context() function from migration 0002_rls_helpers.sql.
// In mock mode, RLS is bypassed (service role key) — this is intentional for development.
// TODO: integrate into all authenticated server actions and route handlers once auth ships.
export async function createOrgScopedClient(orgId: string) {
  const supabase = await createServiceClient()
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'true') {
    // Set RLS context so all queries in this connection are scoped to the org
    await supabase.rpc('set_org_context', { org_id: orgId })
  }
  return supabase
}
