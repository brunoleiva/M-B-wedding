-- Theme tokens and visibility controls, kept per wedding.
create table if not exists public.wedding_appearance (
  wedding_id uuid primary key references public.weddings(id) on delete cascade,
  background_color text not null default '#f8f4ed' check (background_color ~ '^#[0-9a-fA-F]{6}$'),
  surface_color text not null default '#fffdf9' check (surface_color ~ '^#[0-9a-fA-F]{6}$'),
  foreground_color text not null default '#261f1a' check (foreground_color ~ '^#[0-9a-fA-F]{6}$'),
  brand_color text not null default '#65704d' check (brand_color ~ '^#[0-9a-fA-F]{6}$'),
  accent_color text not null default '#a87655' check (accent_color ~ '^#[0-9a-fA-F]{6}$'),
  updated_at timestamptz not null default now()
);
alter table public.wedding_appearance enable row level security;
create policy "public reads published appearance" on public.wedding_appearance
  for select to anon, authenticated using (
    exists(select 1 from public.weddings where id=wedding_id and is_published=true));
create policy "admins manage appearance" on public.wedding_appearance
  for all to authenticated using(public.is_wedding_admin(wedding_id))
  with check(public.is_wedding_admin(wedding_id));
create trigger appearance_updated_at before update on public.wedding_appearance
  for each row execute function public.set_updated_at();
-- A disabled section must remain visible to the page renderer so it can be hidden.
-- These keys are not private information; this policy is scoped to published weddings.
drop policy if exists "public reads enabled sections" on public.site_sections;
create policy "public reads section settings" on public.site_sections
  for select to anon, authenticated using (
    exists(select 1 from public.weddings where id=wedding_id and is_published=true));
