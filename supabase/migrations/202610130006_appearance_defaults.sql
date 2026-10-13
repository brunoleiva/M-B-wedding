-- A separate palette snapshot: the currently active colors remain independent.
alter table public.wedding_appearance
  add column if not exists default_background_color text not null default '#f8f4ed' check (default_background_color ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists default_surface_color text not null default '#fffdf9' check (default_surface_color ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists default_foreground_color text not null default '#261f1a' check (default_foreground_color ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists default_brand_color text not null default '#65704d' check (default_brand_color ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists default_accent_color text not null default '#a87655' check (default_accent_color ~ '^#[0-9a-fA-F]{6}$');
