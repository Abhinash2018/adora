create table public.campaign_records (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  draft_id uuid not null,
  revision integer not null check (revision > 0),
  snapshot_hash text not null,
  expires_at timestamptz not null,
  campaign jsonb not null check (octet_length(campaign::text) < 1000000),
  created_at timestamptz not null default now(),
  unique (owner_id, draft_id, revision)
);
alter table public.campaign_records enable row level security;
-- Only the authenticated server creates immutable approval records. Client workspace
-- JSON is never accepted as proof that a provider campaign was submitted or is active.
revoke all on public.campaign_records from anon, authenticated;
grant all on public.campaign_records to service_role;
