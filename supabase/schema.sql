-- ============================================================
-- RumahKu — Supabase schema + Row Level Security
-- Run this in the Supabase SQL Editor (or via the seed script).
-- ============================================================

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key,                       -- equals auth.users.id for real users
  role text not null check (role in ('tenant','landlord')),
  full_name text not null,
  email text,
  phone text,
  gender text,
  occupation text,
  affiliation text,
  bio text,
  is_verified boolean not null default false,
  rating numeric,
  review_count int not null default 0,
  habits jsonb,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists profiles_select_all on public.profiles;
create policy profiles_select_all on public.profiles for select using (true);
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for insert with check (auth.uid() = id);
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update using (auth.uid() = id);

-- ---------- LISTINGS ----------
create table if not exists public.listings (
  id text primary key default gen_random_uuid()::text,
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  area_id text not null,
  address_line text,
  lat double precision,
  lng double precision,
  price int not null,
  deposit int not null,
  property_type text not null,
  bedrooms int not null default 1,
  bathrooms int not null default 1,
  size_sqft int,
  furnished text not null default 'partial',
  gender_preference text not null default 'any',
  photos jsonb not null default '[]'::jsonb,
  amenities jsonb not null default '[]'::jsonb,
  available_from date,
  current_housemates jsonb not null default '[]'::jsonb,
  status text not null default 'active',
  listed_via text,
  created_at timestamptz not null default now()
);
create index if not exists listings_area_idx on public.listings (area_id);
create index if not exists listings_landlord_idx on public.listings (landlord_id);
alter table public.listings enable row level security;
drop policy if exists listings_select_all on public.listings;
create policy listings_select_all on public.listings for select using (true);
drop policy if exists listings_insert_own on public.listings;
create policy listings_insert_own on public.listings for insert with check (auth.uid() = landlord_id);
drop policy if exists listings_update_own on public.listings;
create policy listings_update_own on public.listings for update using (auth.uid() = landlord_id);
drop policy if exists listings_delete_own on public.listings;
create policy listings_delete_own on public.listings for delete using (auth.uid() = landlord_id);

-- ---------- REVIEWS ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null references public.listings(id) on delete cascade,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
drop policy if exists reviews_select_all on public.reviews;
create policy reviews_select_all on public.reviews for select using (true);
drop policy if exists reviews_insert_auth on public.reviews;
create policy reviews_insert_auth on public.reviews for insert with check (auth.uid() is not null);

-- ---------- APPLICATIONS ----------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null references public.listings(id) on delete cascade,
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  tenant_name text not null,
  message text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.applications enable row level security;
drop policy if exists applications_insert_tenant on public.applications;
create policy applications_insert_tenant on public.applications for insert with check (auth.uid() = tenant_id);
drop policy if exists applications_select_tenant on public.applications;
create policy applications_select_tenant on public.applications for select using (auth.uid() = tenant_id);
drop policy if exists applications_select_landlord on public.applications;
create policy applications_select_landlord on public.applications for select using (
  exists (select 1 from public.listings l where l.id = listing_id and l.landlord_id = auth.uid())
);
drop policy if exists applications_update_landlord on public.applications;
create policy applications_update_landlord on public.applications for update using (
  exists (select 1 from public.listings l where l.id = listing_id and l.landlord_id = auth.uid())
);

-- ---------- SAVED ----------
create table if not exists public.saved (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id text not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
alter table public.saved enable row level security;
drop policy if exists saved_all_self on public.saved;
create policy saved_all_self on public.saved for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- BILLS ----------
create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  listing_id text,
  label text not null,
  type text not null,
  amount int not null,
  due_date date not null,
  status text not null default 'due',
  created_at timestamptz not null default now()
);
alter table public.bills enable row level security;
drop policy if exists bills_all_self on public.bills;
create policy bills_all_self on public.bills for all using (auth.uid() = tenant_id) with check (auth.uid() = tenant_id);

-- ---------- TENANCY AGREEMENTS ----------
create table if not exists public.tenancy_agreements (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid references public.profiles(id) on delete set null,
  tenant_id uuid references public.profiles(id) on delete set null,
  listing_id text,
  data jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.tenancy_agreements enable row level security;
drop policy if exists tenancy_select_party on public.tenancy_agreements;
create policy tenancy_select_party on public.tenancy_agreements for select using (
  auth.uid() = landlord_id or auth.uid() = tenant_id
);
drop policy if exists tenancy_insert_party on public.tenancy_agreements;
create policy tenancy_insert_party on public.tenancy_agreements for insert with check (
  auth.uid() = landlord_id or auth.uid() = tenant_id
);

-- ---------- AUTO-CREATE PROFILE ON SIGNUP ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, email, phone, gender, occupation, affiliation)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'tenant'),
    coalesce(new.raw_user_meta_data->>'full_name', 'New user'),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'gender',
    new.raw_user_meta_data->>'occupation',
    new.raw_user_meta_data->>'affiliation'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
