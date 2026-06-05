-- ============================================================
-- RumahKu — Migration 0003: SafeDeposit (deposit protection + dispute resolution)
-- Idempotent. Run once in the Supabase SQL Editor.
-- Money is NOT custodied here — this is the neutral evidence + agreement +
-- dispute layer. (Custody is a later licensed-partner step.)
-- Reuses the existing 'listing-photos' storage bucket for evidence photos.
-- ============================================================

-- ---------- DEPOSITS ----------
create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  listing_id text references public.listings(id) on delete set null,
  listing_title text,
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  amount int not null default 0,
  proposed_return int,
  -- active | return_proposed | released | disputed
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists deposits_tenant_idx on public.deposits (tenant_id, updated_at desc);
create index if not exists deposits_landlord_idx on public.deposits (landlord_id, updated_at desc);

alter table public.deposits enable row level security;

drop policy if exists deposits_select_party on public.deposits;
create policy deposits_select_party on public.deposits
  for select using (auth.uid() = tenant_id or auth.uid() = landlord_id);

drop policy if exists deposits_insert_landlord on public.deposits;
create policy deposits_insert_landlord on public.deposits
  for insert with check (auth.uid() = landlord_id);

drop policy if exists deposits_update_party on public.deposits;
create policy deposits_update_party on public.deposits
  for update using (auth.uid() = tenant_id or auth.uid() = landlord_id);

-- ---------- DEPOSIT EVENTS (timeline + evidence + dispute messages) ----------
create table if not exists public.deposit_events (
  id uuid primary key default gen_random_uuid(),
  deposit_id uuid not null references public.deposits(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null,
  -- created | movein_evidence | moveout_evidence | return_proposed | accepted | disputed | note | released
  type text not null,
  note text,
  photos jsonb not null default '[]'::jsonb,
  amount int,
  created_at timestamptz not null default now()
);
create index if not exists deposit_events_idx on public.deposit_events (deposit_id, created_at);

alter table public.deposit_events enable row level security;

drop policy if exists deposit_events_select_party on public.deposit_events;
create policy deposit_events_select_party on public.deposit_events
  for select using (
    exists (
      select 1 from public.deposits d
      where d.id = deposit_id and (d.tenant_id = auth.uid() or d.landlord_id = auth.uid())
    )
  );

drop policy if exists deposit_events_insert_party on public.deposit_events;
create policy deposit_events_insert_party on public.deposit_events
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.deposits d
      where d.id = deposit_id and (d.tenant_id = auth.uid() or d.landlord_id = auth.uid())
    )
  );
