-- Pythia cloud sync: one generic table, one row per synced item, last-write-wins.
--
-- The browser (IndexedDB) is the source of truth; this table is a mirror that lets a learner
-- pick up on another device. Every row belongs to exactly one user and Row Level Security
-- makes that the only thing a signed-in user can see or change.
--
-- Run it once: Supabase dashboard -> SQL editor -> paste -> Run (or `supabase db push`).

create sequence if not exists public.records_seq;

create table if not exists public.records (
  user_id    uuid    not null references auth.users (id) on delete cascade,
  -- Which local table the row came from (see src/sync/tables.ts).
  kind       text    not null check (kind in
               ('profile', 'settings', 'lessonProgress', 'attempts', 'drafts',
                'quizResults', 'snippets', 'workspace', 'achievements')),
  key        text    not null check (char_length(key) between 1 and 300),
  -- The record itself; null for a deletion (a tombstone, so deletes reach other devices).
  data       jsonb,
  deleted    boolean not null default false,
  -- Client clock in ms. Last write wins on this value; see the trigger below.
  updated_at bigint  not null check (updated_at >= 0),
  -- Server-assigned order of accepted writes. Clients pull "everything after seq N".
  seq        bigint  not null default nextval('public.records_seq'),
  primary key (user_id, kind, key),
  check (deleted = (data is null)),
  check (data is null or octet_length(data::text) <= 500000)
);

create index if not exists records_user_seq_idx on public.records (user_id, seq);

alter table public.records enable row level security;

-- `(select auth.uid())` is evaluated once per statement instead of once per row.
create policy "own rows: read"   on public.records for select to authenticated using ((select auth.uid()) = user_id);
create policy "own rows: insert" on public.records for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own rows: update" on public.records for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own rows: delete" on public.records for delete to authenticated using ((select auth.uid()) = user_id);

-- Last write wins, enforced here so two devices can't clobber newer data with older data.
-- A stale update is skipped silently (returning null cancels just that row), and every
-- accepted update gets a fresh seq so other devices notice it.
create or replace function public.records_lww() returns trigger
language plpgsql as $$
begin
  if new.updated_at <= old.updated_at then
    return null;
  end if;
  new.seq := nextval('public.records_seq');
  return new;
end;
$$;

drop trigger if exists records_lww on public.records;
create trigger records_lww before update on public.records
  for each row execute function public.records_lww();

-- Lets a learner erase their account and everything in it from inside the app.
-- It can only ever delete the caller's own user: the id comes from the JWT, not from an argument.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = (select auth.uid());
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
