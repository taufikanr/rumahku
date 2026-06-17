-- 0006_property_verification.sql
-- Verified Real — Proof-of-Property capture records.
-- OPTIONAL: the feature renders from the transparent demo model without this
-- table. Run it once to persist real landlord captures (degrades gracefully
-- until then — see src/app/(app)/dashboard/verify/actions.ts).

create table if not exists public.listing_verifications (
  listing_id      text primary key references public.listings(id) on delete cascade,
  status          text not null default 'verified',
  authenticity    int,
  code            text,
  lat             double precision,
  lng             double precision,
  distance_m      int,
  device          text,
  photos_original boolean default true,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

alter table public.listing_verifications enable row level security;

-- A Verified Real certificate is meant to be public / shareable.
drop policy if exists "verifications readable by all" on public.listing_verifications;
create policy "verifications readable by all"
  on public.listing_verifications for select
  using (true);

-- A landlord can only record a verification under their own user id.
drop policy if exists "landlords insert own verification" on public.listing_verifications;
create policy "landlords insert own verification"
  on public.listing_verifications for insert
  with check (auth.uid() = created_by);

drop policy if exists "landlords update own verification" on public.listing_verifications;
create policy "landlords update own verification"
  on public.listing_verifications for update
  using (auth.uid() = created_by);
