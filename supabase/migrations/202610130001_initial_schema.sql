create extension if not exists pgcrypto;

create type public.admin_role as enum ('owner', 'editor');
create type public.rsvp_status as enum ('pending', 'attending', 'not_attending');
create type public.guest_kind as enum ('adult', 'child', 'companion');
create type public.payment_status as enum ('pending_confirmation', 'confirmed', 'rejected');
create type public.moderation_status as enum ('pending', 'approved', 'rejected');
create type public.wedding_status as enum ('pre_wedding', 'wedding_day', 'post_wedding');

create table public.weddings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  first_name text not null,
  second_name text not null,
  event_at timestamptz not null,
  timezone text not null default 'America/Sao_Paulo',
  city text not null,
  hero_title text,
  hero_subtitle text,
  hero_image_path text,
  status public.wedding_status not null default 'pre_wedding',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wedding_private_settings (
  wedding_id uuid primary key references public.weddings(id) on delete cascade,
  pix_receiver_name text,
  pix_key text,
  pix_city text,
  gift_min_amount_cents integer check (gift_min_amount_cents is null or gift_min_amount_cents > 0),
  gift_max_amount_cents integer check (gift_max_amount_cents is null or gift_max_amount_cents > gift_min_amount_cents),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_memberships (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.admin_role not null default 'editor',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (wedding_id, user_id)
);

create table public.site_sections (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  key text not null,
  label text not null,
  is_enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (wedding_id, key)
);

create table public.story_events (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  occurred_on date,
  year_label text,
  title text not null,
  description text not null,
  image_path text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  kind text not null check (kind in ('ceremony', 'reception', 'both')),
  name text not null,
  starts_at timestamptz,
  address text not null,
  description text,
  image_path text,
  google_maps_url text,
  waze_url text,
  map_embed_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.schedule_events (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  starts_at timestamptz not null,
  title text not null,
  description text,
  icon_key text,
  sort_order integer not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.guest_groups (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  display_name text not null,
  invitation_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  phone text,
  admin_notes text,
  max_extra_guests integer not null default 0 check (max_extra_guests between 0 and 10),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  guest_group_id uuid not null references public.guest_groups(id) on delete cascade,
  full_name text not null,
  kind public.guest_kind not null default 'adult',
  rsvp_status public.rsvp_status not null default 'pending',
  dietary_restrictions text,
  guest_note text,
  responded_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gift_categories (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (wedding_id, slug)
);

create table public.gifts (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  category_id uuid references public.gift_categories(id) on delete set null,
  slug text not null,
  title text not null,
  description text,
  image_path text,
  amount_cents integer not null check (amount_cents > 0),
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (wedding_id, slug)
);

create table public.gift_payments (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  gift_id uuid references public.gifts(id) on delete set null,
  guest_name text not null,
  amount_cents integer not null check (amount_cents > 0),
  message text,
  receipt_path text,
  status public.payment_status not null default 'pending_confirmation',
  admin_note text,
  confirmed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.guest_messages (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  guest_name text not null,
  message text not null check (char_length(message) between 2 and 1500),
  status public.moderation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.song_suggestions (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  song text not null,
  artist text not null,
  suggested_by text not null,
  status public.moderation_status not null default 'pending',
  added_to_playlist boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order integer not null default 0,
  unique (wedding_id, slug)
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  category_id uuid references public.gallery_categories(id) on delete set null,
  storage_path text not null,
  alt_text text not null,
  caption text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.special_people (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  name text not null,
  role_label text not null,
  category text not null,
  description text,
  image_path text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_story_events_wedding_order on public.story_events(wedding_id, sort_order);
create index idx_schedule_events_wedding_start on public.schedule_events(wedding_id, starts_at);
create index idx_guest_groups_wedding_active on public.guest_groups(wedding_id) where deleted_at is null;
create index idx_guests_group_status on public.guests(guest_group_id, rsvp_status) where deleted_at is null;
create index idx_guests_wedding_status on public.guests(wedding_id, rsvp_status) where deleted_at is null;
create index idx_gifts_wedding_active on public.gifts(wedding_id, sort_order) where deleted_at is null and is_active = true;
create index idx_payments_wedding_status on public.gift_payments(wedding_id, status) where deleted_at is null;
create index idx_messages_wedding_status on public.guest_messages(wedding_id, status);
create index idx_songs_wedding_status on public.song_suggestions(wedding_id, status);
create index idx_gallery_wedding_order on public.gallery_images(wedding_id, sort_order) where is_published = true;
create index idx_audit_wedding_created on public.audit_logs(wedding_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_wedding_admin(target_wedding_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_memberships membership
    where membership.wedding_id = target_wedding_id
      and membership.user_id = auth.uid()
      and membership.is_active = true
  );
$$;

revoke all on function public.is_wedding_admin(uuid) from public;
grant execute on function public.is_wedding_admin(uuid) to authenticated;

create trigger weddings_updated_at before update on public.weddings for each row execute function public.set_updated_at();
create trigger private_settings_updated_at before update on public.wedding_private_settings for each row execute function public.set_updated_at();
create trigger site_sections_updated_at before update on public.site_sections for each row execute function public.set_updated_at();
create trigger story_events_updated_at before update on public.story_events for each row execute function public.set_updated_at();
create trigger venues_updated_at before update on public.venues for each row execute function public.set_updated_at();
create trigger schedule_events_updated_at before update on public.schedule_events for each row execute function public.set_updated_at();
create trigger guest_groups_updated_at before update on public.guest_groups for each row execute function public.set_updated_at();
create trigger guests_updated_at before update on public.guests for each row execute function public.set_updated_at();
create trigger gifts_updated_at before update on public.gifts for each row execute function public.set_updated_at();
create trigger payments_updated_at before update on public.gift_payments for each row execute function public.set_updated_at();
create trigger messages_updated_at before update on public.guest_messages for each row execute function public.set_updated_at();
create trigger songs_updated_at before update on public.song_suggestions for each row execute function public.set_updated_at();
create trigger gallery_images_updated_at before update on public.gallery_images for each row execute function public.set_updated_at();
create trigger special_people_updated_at before update on public.special_people for each row execute function public.set_updated_at();
create trigger faqs_updated_at before update on public.faqs for each row execute function public.set_updated_at();

alter table public.weddings enable row level security;
alter table public.wedding_private_settings enable row level security;
alter table public.admin_memberships enable row level security;
alter table public.site_sections enable row level security;
alter table public.story_events enable row level security;
alter table public.venues enable row level security;
alter table public.schedule_events enable row level security;
alter table public.guest_groups enable row level security;
alter table public.guests enable row level security;
alter table public.gift_categories enable row level security;
alter table public.gifts enable row level security;
alter table public.gift_payments enable row level security;
alter table public.guest_messages enable row level security;
alter table public.song_suggestions enable row level security;
alter table public.gallery_categories enable row level security;
alter table public.gallery_images enable row level security;
alter table public.special_people enable row level security;
alter table public.faqs enable row level security;
alter table public.audit_logs enable row level security;

create policy "published weddings are public" on public.weddings for select to anon, authenticated using (is_published = true);
create policy "admins manage weddings" on public.weddings for all to authenticated using (public.is_wedding_admin(id)) with check (public.is_wedding_admin(id));

create policy "admins manage private settings" on public.wedding_private_settings for all to authenticated using (public.is_wedding_admin(wedding_id)) with check (public.is_wedding_admin(wedding_id));
create policy "members can read own memberships" on public.admin_memberships for select to authenticated using (user_id = auth.uid());

create policy "public reads enabled sections" on public.site_sections for select to anon, authenticated using (is_enabled and exists (select 1 from public.weddings w where w.id = wedding_id and w.is_published));
create policy "admins manage sections" on public.site_sections for all to authenticated using (public.is_wedding_admin(wedding_id)) with check (public.is_wedding_admin(wedding_id));

create policy "public reads story" on public.story_events for select to anon, authenticated using (is_published and exists (select 1 from public.weddings w where w.id = wedding_id and w.is_published));
create policy "admins manage story" on public.story_events for all to authenticated using (public.is_wedding_admin(wedding_id)) with check (public.is_wedding_admin(wedding_id));

create policy "public reads venues" on public.venues for select to anon, authenticated using (is_published and exists (select 1 from public.weddings w where w.id = wedding_id and w.is_published));
create policy "admins manage venues" on public.venues for all to authenticated using (public.is_wedding_admin(wedding_id)) with check (public.is_wedding_admin(wedding_id));

create policy "public reads schedule" on public.schedule_events for select to anon, authenticated using (is_public and exists (select 1 from public.weddings w where w.id = wedding_id and w.is_published));
create policy "admins manage schedule" on public.schedule_events for all to authenticated using (public.is_wedding_admin(wedding_id)) with check (public.is_wedding_admin(wedding_id));

create policy "admins manage guest groups" on public.guest_groups for all to authenticated using (public.is_wedding_admin(wedding_id)) with check (public.is_wedding_admin(wedding_id));
create policy "admins manage guests" on public.guests for all to authenticated using (public.is_wedding_admin(wedding_id)) with check (public.is_wedding_admin(wedding_id));

create policy "public reads gift categories" on public.gift_categories for select to anon, authenticated using (exists (select 1 from public.weddings w where w.id = wedding_id and w.is_published));
create policy "admins manage gift categories" on public.gift_categories for all to authenticated using (public.is_wedding_admin(wedding_id)) with check (public.is_wedding_admin(wedding_id));

create policy "public reads active gifts" on public.gifts for select to anon, authenticated using (is_active and deleted_at is null and exists (select 1 from public.weddings w where w.id = wedding_id and w.is_published));
create policy "admins manage gifts" on public.gifts for all to authenticated using (public.is_wedding_admin(wedding_id)) with check (public.is_wedding_admin(wedding_id));

create policy "public may report gift payment" on public.gift_payments for insert to anon, authenticated with check (status = 'pending_confirmation' and deleted_at is null and exists (select 1 from public.weddings w where w.id = wedding_id and w.is_published));
create policy "admins manage gift payments" on public.gift_payments for all to authenticated using (public.is_wedding_admin(wedding_id)) with check (public.is_wedding_admin(wedding_id));

create policy "public may submit messages" on public.guest_messages for insert to anon, authenticated with check (status = 'pending' and exists (select 1 from public.weddings w where w.id = wedding_id and w.is_published));
create policy "public reads approved messages" on public.guest_messages for select to anon, authenticated using (status = 'approved' and exists (select 1 from public.weddings w where w.id = wedding_id and w.is_published));
create policy "admins manage messages" on public.guest_messages for all to authenticated using (public.is_wedding_admin(wedding_id)) with check (public.is_wedding_admin(wedding_id));

create policy "public may submit songs" on public.song_suggestions for insert to anon, authenticated with check (status = 'pending' and exists (select 1 from public.weddings w where w.id = wedding_id and w.is_published));
create policy "admins manage songs" on public.song_suggestions for all to authenticated using (public.is_wedding_admin(wedding_id)) with check (public.is_wedding_admin(wedding_id));

create policy "public reads gallery categories" on public.gallery_categories for select to anon, authenticated using (exists (select 1 from public.weddings w where w.id = wedding_id and w.is_published));
create policy "admins manage gallery categories" on public.gallery_categories for all to authenticated using (public.is_wedding_admin(wedding_id)) with check (public.is_wedding_admin(wedding_id));

create policy "public reads gallery images" on public.gallery_images for select to anon, authenticated using (is_published and exists (select 1 from public.weddings w where w.id = wedding_id and w.is_published));
create policy "admins manage gallery images" on public.gallery_images for all to authenticated using (public.is_wedding_admin(wedding_id)) with check (public.is_wedding_admin(wedding_id));

create policy "public reads special people" on public.special_people for select to anon, authenticated using (is_published and exists (select 1 from public.weddings w where w.id = wedding_id and w.is_published));
create policy "admins manage special people" on public.special_people for all to authenticated using (public.is_wedding_admin(wedding_id)) with check (public.is_wedding_admin(wedding_id));

create policy "public reads faqs" on public.faqs for select to anon, authenticated using (is_active and exists (select 1 from public.weddings w where w.id = wedding_id and w.is_published));
create policy "admins manage faqs" on public.faqs for all to authenticated using (public.is_wedding_admin(wedding_id)) with check (public.is_wedding_admin(wedding_id));

create policy "admins read audit logs" on public.audit_logs for select to authenticated using (public.is_wedding_admin(wedding_id));
create policy "admins create audit logs" on public.audit_logs for insert to authenticated with check (public.is_wedding_admin(wedding_id) and actor_user_id = auth.uid());
