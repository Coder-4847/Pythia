// @vitest-environment node
import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Runs the real migration in an in-process Postgres (PGlite) with just enough of Supabase's
 * `auth` schema and roles stubbed, so the Row Level Security policies and the last-write-wins
 * trigger are actually exercised rather than assumed.
 */
const A = '11111111-1111-1111-1111-111111111111'
const B = '22222222-2222-2222-2222-222222222222'

let pg: PGlite

async function as(user: string | null, run: () => Promise<void>) {
  await pg.exec(`set role ${user ? 'authenticated' : 'anon'}; select set_config('request.jwt.claim.sub', '${user ?? ''}', false);`)
  try {
    await run()
  } finally {
    await pg.exec('reset role')
  }
}

beforeAll(async () => {
  pg = new PGlite()
  await pg.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    grant usage on schema public to anon, authenticated;
    insert into auth.users values ('${A}'), ('${B}');
  `)
  await pg.exec(readFileSync('supabase/migrations/0001_records.sql', 'utf8'))
  await pg.exec('grant select, insert, update, delete on public.records to authenticated; grant usage on sequence public.records_seq to authenticated;')
})
afterAll(() => pg.close())

const row = (user: string, key: string, updated: number, data: object | null = { n: updated }) =>
  pg.query(`insert into public.records (user_id, kind, key, data, deleted, updated_at) values ($1, 'attempts', $2, $3, $4, $5)
            on conflict (user_id, kind, key) do update set data = excluded.data, deleted = excluded.deleted, updated_at = excluded.updated_at`, [
    user,
    key,
    data === null ? null : JSON.stringify(data),
    data === null,
    updated,
  ])

describe('records table', () => {
  it('lets a user read and write only their own rows', async () => {
    await as(A, async () => void (await row(A, 'a1', 10)))
    await as(B, async () => void (await row(B, 'b1', 10)))
    await as(A, async () => {
      const { rows } = await pg.query<{ key: string }>('select key from public.records order by key')
      expect(rows.map((r) => r.key)).toEqual(['a1'])
    })
    await as(B, async () => {
      const { rows } = await pg.query<{ key: string }>('select key from public.records order by key')
      expect(rows.map((r) => r.key)).toEqual(['b1'])
    })
  })

  it('rejects writing a row for someone else', async () => {
    await as(A, async () => {
      await expect(row(B, 'sneaky', 1)).rejects.toThrow(/row-level security/)
    })
  })

  it('cannot update or delete another user’s rows (they are invisible)', async () => {
    await as(A, async () => {
      const upd = await pg.query(`update public.records set data = '{"x":1}', updated_at = 99 where user_id = $1`, [B])
      const del = await pg.query('delete from public.records where user_id = $1', [B])
      expect(upd.affectedRows).toBe(0)
      expect(del.affectedRows).toBe(0)
    })
  })

  it('signed-out visitors see nothing and write nothing', async () => {
    await pg.exec('grant select, insert on public.records to anon')
    await as(null, async () => {
      expect((await pg.query('select * from public.records')).rows).toHaveLength(0)
      await expect(row(A, 'anon', 1)).rejects.toThrow()
    })
  })

  it('keeps the newer write when an older one arrives late (last write wins)', async () => {
    await as(A, async () => {
      await row(A, 'lww', 100, { v: 'new' })
      await row(A, 'lww', 50, { v: 'stale' })
      const { rows } = await pg.query<{ data: { v: string }; updated_at: string }>(`select data, updated_at from public.records where key = 'lww'`)
      expect(rows[0]!.data.v).toBe('new')
      expect(Number(rows[0]!.updated_at)).toBe(100)
      await row(A, 'lww', 100, { v: 'same-time' }) // ties don't overwrite either
      expect((await pg.query<{ data: { v: string } }>(`select data from public.records where key = 'lww'`)).rows[0]!.data.v).toBe('new')
    })
  })

  it('gives accepted updates a higher seq, and leaves a skipped one alone', async () => {
    await as(A, async () => {
      await row(A, 'seq', 10)
      const first = Number((await pg.query<{ seq: string }>(`select seq from public.records where key = 'seq'`)).rows[0]!.seq)
      await row(A, 'seq', 5) // stale: skipped
      expect(Number((await pg.query<{ seq: string }>(`select seq from public.records where key = 'seq'`)).rows[0]!.seq)).toBe(first)
      await row(A, 'seq', 20)
      expect(Number((await pg.query<{ seq: string }>(`select seq from public.records where key = 'seq'`)).rows[0]!.seq)).toBeGreaterThan(first)
    })
  })

  it('stores a deletion as a tombstone and refuses inconsistent rows', async () => {
    await as(A, async () => {
      await row(A, 'tomb', 1)
      await row(A, 'tomb', 2, null)
      const { rows } = await pg.query<{ deleted: boolean; data: unknown }>(`select deleted, data from public.records where key = 'tomb'`)
      expect(rows[0]).toEqual({ deleted: true, data: null })
      await expect(pg.query(`insert into public.records (user_id, kind, key, data, deleted, updated_at) values ($1, 'attempts', 'bad', null, false, 1)`, [A])).rejects.toThrow()
      await expect(pg.query(`insert into public.records (user_id, kind, key, data, deleted, updated_at) values ($1, 'nonsense', 'bad2', '{}', false, 1)`, [A])).rejects.toThrow()
    })
  })

  it('delete_my_account removes the caller, and their rows with them, only', async () => {
    await as(A, async () => void (await pg.query('select public.delete_my_account()')))
    expect((await pg.query('select id from auth.users')).rows).toEqual([{ id: B }])
    expect(((await pg.query('select count(*)::int as n from public.records where user_id = $1', [A])).rows[0] as { n: number }).n).toBe(0)
    expect(((await pg.query('select count(*)::int as n from public.records where user_id = $1', [B])).rows[0] as { n: number }).n).toBeGreaterThan(0)
  })

  it('delete_my_account is not callable by signed-out visitors', async () => {
    await as(null, async () => {
      await expect(pg.query('select public.delete_my_account()')).rejects.toThrow()
    })
  })
})
