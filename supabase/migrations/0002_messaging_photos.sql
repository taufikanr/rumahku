-- ============================================================
-- RumahKu — Migration 0002: In-app messaging + listing photo storage
-- Idempotent. Run once in the Supabase SQL Editor.
-- ============================================================

-- ---------- CONVERSATIONS ----------
-- One thread per (listing, tenant, landlord) trio.
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id text references public.listings(id) on delete set null,
  listing_title text,
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  unique (listing_id, tenant_id, landlord_id)
);
create index if not exists conversations_tenant_idx on public.conversations (tenant_id, last_message_at desc);
create index if not exists conversations_landlord_idx on public.conversations (landlord_id, last_message_at desc);

alter table public.conversations enable row level security;

drop policy if exists conversations_select_party on public.conversations;
create policy conversations_select_party on public.conversations
  for select using (auth.uid() = tenant_id or auth.uid() = landlord_id);

drop policy if exists conversations_insert_party on public.conversations;
create policy conversations_insert_party on public.conversations
  for insert with check (auth.uid() = tenant_id or auth.uid() = landlord_id);

drop policy if exists conversations_update_party on public.conversations;
create policy conversations_update_party on public.conversations
  for update using (auth.uid() = tenant_id or auth.uid() = landlord_id);

-- ---------- MESSAGES ----------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

alter table public.messages enable row level security;

-- A user may read/write messages only in conversations they belong to.
drop policy if exists messages_select_party on public.messages;
create policy messages_select_party on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.tenant_id = auth.uid() or c.landlord_id = auth.uid())
    )
  );

drop policy if exists messages_insert_party on public.messages;
create policy messages_insert_party on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.tenant_id = auth.uid() or c.landlord_id = auth.uid())
    )
  );

-- Allow marking the other party's messages as read.
drop policy if exists messages_update_party on public.messages;
create policy messages_update_party on public.messages
  for update using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.tenant_id = auth.uid() or c.landlord_id = auth.uid())
    )
  );

-- Bump the parent conversation's last_message_at on every new message.
create or replace function public.bump_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
    set last_message_at = new.created_at
    where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_message_created on public.messages;
create trigger on_message_created
  after insert on public.messages
  for each row execute function public.bump_conversation();

-- Realtime for live message delivery (guard against duplicate add).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- ---------- LISTING PHOTO STORAGE ----------
-- Public-read bucket; authenticated users upload into a folder named by their uid.
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

drop policy if exists listing_photos_public_read on storage.objects;
create policy listing_photos_public_read on storage.objects
  for select using (bucket_id = 'listing-photos');

drop policy if exists listing_photos_owner_insert on storage.objects;
create policy listing_photos_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists listing_photos_owner_update on storage.objects;
create policy listing_photos_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists listing_photos_owner_delete on storage.objects;
create policy listing_photos_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
