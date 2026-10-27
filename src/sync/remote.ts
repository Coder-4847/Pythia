import type { SupabaseClient } from '@supabase/supabase-js'
import type { Remote, RemoteRecord } from '@/sync/engine'

/** The cloud side of sync, over Supabase's REST API. Row Level Security scopes every call to the signed-in user. */
export function supabaseRemote(client: SupabaseClient, userId: string): Remote {
  return {
    async push(rows) {
      const { error } = await client
        .from('records')
        .upsert(
          rows.map((r) => ({ user_id: userId, kind: r.kind, key: r.key, data: r.data, deleted: r.deleted, updated_at: r.updated_at })),
          { onConflict: 'user_id,kind,key' },
        )
      if (error) throw error
    },
    async pull(after, limit) {
      const { data, error } = await client
        .from('records')
        .select('kind,key,data,deleted,updated_at,seq')
        .gt('seq', after)
        .order('seq', { ascending: true })
        .limit(limit)
      if (error) throw error
      return (data ?? []).map((r) => ({ ...r, updated_at: Number(r.updated_at), seq: Number(r.seq) })) as RemoteRecord[]
    },
  }
}
