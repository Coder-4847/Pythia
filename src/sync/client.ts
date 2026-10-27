import type { SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/sync/config'

let client: Promise<SupabaseClient> | undefined

/** The Supabase SDK is a separate chunk: it is only fetched when accounts are configured. */
export function getClient(): Promise<SupabaseClient> {
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      // PKCE puts a one-time `?code=` in the query string, which coexists with the hash router.
      // The default (implicit) flow returns tokens in `#access_token=…`, which the router would mangle.
      auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    }),
  )
  return client
}
