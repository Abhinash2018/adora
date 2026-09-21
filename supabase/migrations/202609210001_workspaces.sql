create table public.workspaces (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{"draft":null,"connections":[],"campaigns":[]}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint workspace_size check (octet_length(data::text) < 1000000)
);
alter table public.workspaces enable row level security;
create policy "Owner reads workspace" on public.workspaces for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Owner creates workspace" on public.workspaces for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "Owner updates workspace" on public.workspaces for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
grant select, insert, update on public.workspaces to authenticated;
revoke all on public.workspaces from anon;

create table public.business_profiles (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  constraint profile_size check (octet_length(data::text) < 20000)
);
alter table public.business_profiles enable row level security;
create policy "Owner reads profile" on public.business_profiles for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Owner creates profile" on public.business_profiles for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "Owner updates profile" on public.business_profiles for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
grant select, insert, update on public.business_profiles to authenticated;
revoke all on public.business_profiles from anon;

-- Workspaces contain editable drafts only. They never authorize money-moving operations.
-- Server-owned campaign records and encrypted provider credentials are separate tables.
