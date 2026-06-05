-- ============================================================
-- RumahKu — Migration 0005: real per-user Trust Passport data
-- Idempotent. Run once in the Supabase SQL Editor.
-- Powers the Rent Score from each tenant's actual record. The app falls
-- back to demo data when a user has no rows yet, so it never looks empty.
-- ============================================================

-- ---------- RENT PAYMENTS ----------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  listing_id text references public.listings(id) on delete set null,
  label text not null,
  amount int not null,
  paid_on date not null,
  on_time boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists payments_tenant_idx on public.payments (tenant_id, paid_on desc);
alter table public.payments enable row level security;
drop policy if exists payments_all_self on public.payments;
create policy payments_all_self on public.payments
  for all using (auth.uid() = tenant_id) with check (auth.uid() = tenant_id);
-- Landlords may read a tenant's payment record (for the Trust Passport).
drop policy if exists payments_select_all on public.payments;
create policy payments_select_all on public.payments for select using (true);

-- ---------- TENANCIES (rental history / CV) ----------
create table if not exists public.tenancies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  property text not null,
  area text,
  landlord_name text,
  landlord_verified boolean not null default false,
  start_label text not null,
  end_label text,
  months int not null default 0,
  on_time_rate int not null default 100,
  created_at timestamptz not null default now()
);
create index if not exists tenancies_tenant_idx on public.tenancies (tenant_id, created_at desc);
alter table public.tenancies enable row level security;
drop policy if exists tenancies_select_all on public.tenancies;
create policy tenancies_select_all on public.tenancies for select using (true);
drop policy if exists tenancies_write_self on public.tenancies;
create policy tenancies_write_self on public.tenancies
  for all using (auth.uid() = tenant_id) with check (auth.uid() = tenant_id);

-- ---------- TENANT REVIEWS (landlord → tenant) ----------
create table if not exists public.tenant_reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  landlord_id uuid references public.profiles(id) on delete set null,
  landlord_name text not null,
  landlord_verified boolean not null default false,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);
create index if not exists tenant_reviews_tenant_idx on public.tenant_reviews (tenant_id, created_at desc);
alter table public.tenant_reviews enable row level security;
drop policy if exists tenant_reviews_select_all on public.tenant_reviews;
create policy tenant_reviews_select_all on public.tenant_reviews for select using (true);
drop policy if exists tenant_reviews_insert_landlord on public.tenant_reviews;
create policy tenant_reviews_insert_landlord on public.tenant_reviews
  for insert with check (auth.uid() = landlord_id);
