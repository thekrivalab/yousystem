create table if not exists public.user_storage_snapshots (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_storage_snapshots enable row level security;

drop policy if exists "read own storage" on public.user_storage_snapshots;
create policy "read own storage"
on public.user_storage_snapshots
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "insert own storage" on public.user_storage_snapshots;
create policy "insert own storage"
on public.user_storage_snapshots
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "update own storage" on public.user_storage_snapshots;
create policy "update own storage"
on public.user_storage_snapshots
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "delete own storage" on public.user_storage_snapshots;
create policy "delete own storage"
on public.user_storage_snapshots
for delete
to authenticated
using (auth.uid() = user_id);
