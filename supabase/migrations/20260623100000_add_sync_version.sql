-- Add sync versioning columns for conflict-aware blob sync
alter table public.user_storage_snapshots
  add column if not exists sync_version integer not null default 1;

create index if not exists user_storage_snapshots_sync_version_idx
  on public.user_storage_snapshots (sync_version desc);

comment on column public.user_storage_snapshots.sync_version is
  'Monotonic version for multi-device snapshot merge';
