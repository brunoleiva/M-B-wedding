-- Header and button palette are independent of the existing five colors.
alter table public.wedding_appearance
  add column if not exists header_color text not null default '#211a16' check (header_color ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists header_text_color text not null default '#ffffff' check (header_text_color ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists header_hover_color text not null default '#c5b69f' check (header_hover_color ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists button_text_color text not null default '#ffffff' check (button_text_color ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists button_hover_color text not null default '#4e5939' check (button_hover_color ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists default_header_color text not null default '#211a16' check (default_header_color ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists default_header_text_color text not null default '#ffffff' check (default_header_text_color ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists default_header_hover_color text not null default '#c5b69f' check (default_header_hover_color ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists default_button_text_color text not null default '#ffffff' check (default_button_text_color ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists default_button_hover_color text not null default '#4e5939' check (default_button_hover_color ~ '^#[0-9a-fA-F]{6}$');
