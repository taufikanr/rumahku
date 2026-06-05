-- ============================================================
-- RumahKu — Migration 0004: saved-search alerts, viewing scheduler,
-- and verified video walkthroughs. Idempotent. Run once in the SQL Editor.
-- ============================================================

-- ---------- SAVED SEARCHES ----------
create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  -- the browse filters, stored as a query object
  query jsonb not null default '{}'::jsonb,
  notify boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists saved_searches_user_idx on public.saved_searches (user_id, created_at desc);

alter table public.saved_searches enable row level security;
drop policy if exists saved_searches_all_self on public.saved_searches;
create policy saved_searches_all_self on public.saved_searches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- VIEWINGS ----------
create table if not exists public.viewings (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null references public.listings(id) on delete cascade,
  listing_title text,
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  preferred_at timestamptz not null,
  note text,
  -- pending | confirmed | declined
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists viewings_tenant_idx on public.viewings (tenant_id, created_at desc);
create index if not exists viewings_landlord_idx on public.viewings (landlord_id, created_at desc);

alter table public.viewings enable row level security;

drop policy if exists viewings_select_party on public.viewings;
create policy viewings_select_party on public.viewings
  for select using (auth.uid() = tenant_id or auth.uid() = landlord_id);

drop policy if exists viewings_insert_tenant on public.viewings;
create policy viewings_insert_tenant on public.viewings
  for insert with check (auth.uid() = tenant_id);

drop policy if exists viewings_update_party on public.viewings;
create policy viewings_update_party on public.viewings
  for update using (auth.uid() = tenant_id or auth.uid() = landlord_id);

-- ---------- VERIFIED VIDEO WALKTHROUGH ----------
alter table public.listings add column if not exists walkthrough_url text;
