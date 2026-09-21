create table public.oauth_states (
  hash text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('google','meta')),
  expires_at timestamptz not null
);
create table public.provider_connections (
  owner_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('google','meta')),
  encrypted_tokens text not null,
  status text not null check (status in ('connected','expired','missing_permission')),
  account_id text, account_name text, asset_id text, asset_name text, instagram_id text,
  primary key (owner_id, provider)
);
alter table public.oauth_states enable row level security;
alter table public.provider_connections enable row level security;
revoke all on public.oauth_states, public.provider_connections from anon, authenticated;
-- Only the server service role may access encrypted tokens or consume OAuth state.
grant all on public.oauth_states, public.provider_connections to service_role;
