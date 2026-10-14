-- Fase 8.1 — extensao nao destrutiva das tabelas de presentes existentes.
-- Execute depois de 202610130001_initial_schema.sql. Nunca apaga registros.
begin;

alter table public.gifts
  add column if not exists gift_kind text not null default 'symbolic',
  add column if not exists availability_kind text not null default 'unlimited',
  add column if not exists quantity_total integer,
  add column if not exists published_at timestamptz;

alter table public.gifts
  add constraint gifts_kind_valid check (gift_kind in ('symbolic', 'physical', 'contribution')),
  add constraint gifts_availability_valid check (availability_kind in ('unlimited', 'limited')),
  add constraint gifts_quantity_valid check (
    (availability_kind = 'unlimited' and quantity_total is null)
    or (availability_kind = 'limited' and quantity_total is not null and quantity_total > 0)
  );

-- Configuracoes Pix ficam na tabela privada JA EXISTENTE, jamais em uma view publica.
alter table public.wedding_private_settings
  add column if not exists gifts_enabled boolean not null default false,
  add column if not exists gift_intro text,
  add column if not exists gift_thank_you text,
  add column if not exists gift_reservation_minutes integer not null default 30;
alter table public.wedding_private_settings
  add constraint gift_reservation_minutes_valid check (gift_reservation_minutes between 5 and 1440);

-- Pagamentos devem ser criados por um endpoint validado e autenticado no servidor
-- na etapa 8.4; NAO permitir insert arbitrario pelo cliente publico.
drop policy if exists "public may report gift payment" on public.gift_payments;

-- Identificador da tentativa de checkout (futura etapa 8.4) evita criacao repetida.
alter table public.gift_payments
  add column if not exists request_key uuid,
  add column if not exists quantity integer not null default 1,
  add column if not exists reviewed_by uuid references auth.users(id),
  add column if not exists reviewed_at timestamptz;
alter table public.gift_payments
  add constraint gift_payment_quantity_valid check (quantity between 1 and 50);
create unique index if not exists gift_payments_request_key_unique
  on public.gift_payments(wedding_id, request_key) where request_key is not null;

-- Validacao entre referencias para evitar mistura de presentes/casamentos.
create or replace function public.validate_gift_wedding_refs()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_name = 'gifts' and new.category_id is not null then
    if not exists (select 1 from public.gift_categories c
                   where c.id = new.category_id and c.wedding_id = new.wedding_id) then
      raise exception 'Categoria pertence a outro casamento';
    end if;
  elsif tg_table_name = 'gift_payments' and new.gift_id is not null then
    if not exists (select 1 from public.gifts g
                   where g.id = new.gift_id and g.wedding_id = new.wedding_id) then
      raise exception 'Presente pertence a outro casamento';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists gifts_wedding_refs on public.gifts;
create trigger gifts_wedding_refs before insert or update of category_id,wedding_id on public.gifts
  for each row execute function public.validate_gift_wedding_refs();
drop trigger if exists payments_wedding_refs on public.gift_payments;
create trigger payments_wedding_refs before insert or update of gift_id,wedding_id on public.gift_payments
  for each row execute function public.validate_gift_wedding_refs();
revoke execute on function public.validate_gift_wedding_refs() from public;

-- Historico imutavel por interfaces publicas; administradores tem leitura apenas.
create table if not exists public.gift_payment_events (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  payment_id uuid not null references public.gift_payments(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('created','confirmed','rejected','reopened','note')),
  previous_status public.payment_status,
  next_status public.payment_status,
  details text,
  created_at timestamptz not null default now()
);
create index if not exists gift_payment_events_payment_date
  on public.gift_payment_events(payment_id, created_at desc);
alter table public.gift_payment_events enable row level security;
drop policy if exists "admins read gift payment events" on public.gift_payment_events;
create policy "admins read gift payment events" on public.gift_payment_events
  for select to authenticated using (public.is_wedding_admin(wedding_id));

-- Impede gravar evento de outro casamento, mesmo quando o ID do pagamento existe.
create or replace function public.validate_gift_payment_event_wedding()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.gift_payments p
                 where p.id = new.payment_id and p.wedding_id = new.wedding_id) then
    raise exception 'Pagamento e evento devem pertencer ao mesmo casamento';
  end if;
  return new;
end;
$$;
drop trigger if exists gift_event_wedding_check on public.gift_payment_events;
create trigger gift_event_wedding_check before insert or update on public.gift_payment_events
  for each row execute function public.validate_gift_payment_event_wedding();

-- Auditoria de mudancas de status; nao grava dados bancarios sensiveis.
create or replace function public.audit_gift_payment_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.gift_payment_events(wedding_id,payment_id,actor_user_id,event_type,next_status)
    values(new.wedding_id,new.id,auth.uid(),'created',new.status);
  elsif new.status is distinct from old.status then
    insert into public.gift_payment_events(wedding_id,payment_id,actor_user_id,event_type,previous_status,next_status)
    values(new.wedding_id,new.id,auth.uid(),
      case when new.status = 'confirmed' then 'confirmed'
           when new.status = 'rejected' then 'rejected' else 'reopened' end,
      old.status,new.status);
  end if;
  return new;
end;
$$;
drop trigger if exists audit_gift_payments_status on public.gift_payments;
create trigger audit_gift_payments_status after insert or update of status on public.gift_payments
  for each row execute function public.audit_gift_payment_status();

-- O cliente publico nao pode modificar eventos. A trigger roda no contexto de
-- proprietario da funcao; RLS e grants de escrita nao sao dados ao navegador.
revoke all on public.gift_payment_events from anon, authenticated;
grant select on public.gift_payment_events to authenticated;
revoke execute on function public.validate_gift_payment_event_wedding() from public;
revoke execute on function public.audit_gift_payment_status() from public;

create index if not exists gifts_public_catalog_idx
  on public.gifts(wedding_id, is_active, sort_order)
  where deleted_at is null;
create index if not exists gift_payments_gift_status_idx
  on public.gift_payments(gift_id, status)
  where deleted_at is null;

commit;
