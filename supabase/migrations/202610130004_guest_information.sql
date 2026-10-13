-- Informações opcionais aos convidados. Manter o conteúdo privado até publicação.
create table public.guest_information (
 wedding_id uuid primary key references public.weddings(id) on delete cascade,
 dress_title text, dress_description text, colors_to_avoid text,
 transport_text text, parking_text text,
 is_published boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create trigger guest_information_updated_at before update on public.guest_information for each row execute function public.set_updated_at();
alter table public.guest_information enable row level security;
create policy "published guest information" on public.guest_information for select to anon, authenticated
 using (is_published and exists (select 1 from public.weddings w where w.id=wedding_id and w.is_published));
create policy "admins manage guest information" on public.guest_information for all to authenticated
 using (public.is_wedding_admin(wedding_id)) with check (public.is_wedding_admin(wedding_id));

create table public.recommended_hotels (
 id uuid primary key default gen_random_uuid(),
 wedding_id uuid not null references public.weddings(id) on delete cascade,
 name text not null, address text, notes text, website_url text,
 sort_order integer not null default 0, is_published boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index recommended_hotels_order on public.recommended_hotels(wedding_id,sort_order);
create trigger recommended_hotels_updated_at before update on public.recommended_hotels for each row execute function public.set_updated_at();
alter table public.recommended_hotels enable row level security;
create policy "published hotels" on public.recommended_hotels for select to anon, authenticated
 using (is_published and exists (select 1 from public.weddings w where w.id=wedding_id and w.is_published));
create policy "admins manage hotels" on public.recommended_hotels for all to authenticated
 using (public.is_wedding_admin(wedding_id)) with check (public.is_wedding_admin(wedding_id));
