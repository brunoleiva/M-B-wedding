-- Fases 8.4 e 8.5: Pix direto, reserva transacional e revisao manual.
-- Requer migrations 001, 009 e 010. Execute uma vez no SQL Editor.
begin;

alter table public.gift_payments
  add column if not exists checkout_token uuid,
  add column if not exists expires_at timestamptz;
create unique index if not exists gift_checkout_token_unique on public.gift_payments(checkout_token)
  where checkout_token is not null;

-- Confirmacao de pagamento SEMPRE administrativa. Funcao publica so gera PENDENTES.
create or replace function public.create_gift_pix_order(
  p_gift_id uuid, p_guest_name text, p_message text, p_request_key uuid
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_gift public.gifts%rowtype;
  v_settings public.wedding_private_settings%rowtype;
  v_token uuid;
  v_reserved bigint;
  v_minutes integer;
begin
  if p_request_key is null or p_gift_id is null
     or length(btrim(coalesce(p_guest_name,''))) not between 2 and 160
     or length(coalesce(p_message,'')) > 1000 then
    raise exception 'Dados invalidos para o pedido';
  end if;

  -- Uma transacao por presente evita duas reservas do ultimo item.
  perform pg_advisory_xact_lock(hashtextextended(p_gift_id::text, 0));
  select * into v_gift from public.gifts
    where id = p_gift_id and is_active = true and deleted_at is null for update;
  if not found then raise exception 'Presente indisponivel'; end if;
  if not exists (select 1 from public.weddings w where w.id=v_gift.wedding_id and w.is_published) or
     not exists (select 1 from public.site_sections s where s.wedding_id=v_gift.wedding_id and s.key='presentes' and s.is_enabled) then
    raise exception 'Catalogo indisponivel';
  end if;
  select * into v_settings from public.wedding_private_settings where wedding_id=v_gift.wedding_id;
  if not found or v_settings.gifts_enabled is not true or
    nullif(btrim(coalesce(v_settings.pix_key,'')),'') is null or
    nullif(btrim(coalesce(v_settings.pix_receiver_name,'')),'') is null or
    nullif(btrim(coalesce(v_settings.pix_city,'')),'') is null then
    raise exception 'Pix ainda nao configurado';
  end if;

  -- Repetir a mesma requisicao retorna sempre o mesmo checkout.
  select checkout_token into v_token from public.gift_payments
    where wedding_id=v_gift.wedding_id and request_key=p_request_key;
  if found then return v_token; end if;

  if v_gift.availability_kind='limited' then
    select coalesce(sum(p.quantity),0) into v_reserved from public.gift_payments p
      where p.gift_id=v_gift.id and p.deleted_at is null and (
        p.status='confirmed' or
        (p.status='pending_confirmation' and p.expires_at > now())
      );
    if v_reserved >= v_gift.quantity_total then raise exception 'Presente esgotado'; end if;
  end if;
  v_minutes := coalesce(v_settings.gift_reservation_minutes, 30);
  v_token := gen_random_uuid();
  insert into public.gift_payments(
    wedding_id,gift_id,guest_name,amount_cents,message,status,
    quantity,request_key,checkout_token,expires_at
  ) values (
    v_gift.wedding_id,v_gift.id,btrim(p_guest_name),v_gift.amount_cents,
    nullif(btrim(coalesce(p_message,'')),''),'pending_confirmation',
    1,p_request_key,v_token,now()+make_interval(mins=>v_minutes)
  );
  return v_token;
end;
$$;
revoke all on function public.create_gift_pix_order(uuid,text,text,uuid) from public;
grant execute on function public.create_gift_pix_order(uuid,text,text,uuid) to anon,authenticated;

-- O token e secreto e nao sequencial; a consulta revela somente os dados
-- necessarios para que o portador do link conclua o Pix.
create or replace function public.read_gift_pix_order(p_checkout_token uuid)
returns table(
  gift_title text, amount_cents integer, guest_name text,
  payment_status public.payment_status, expires_at timestamptz,
  pix_key text, receiver_name text, receiver_city text
)
language sql stable security definer set search_path = ''
as $$
  select g.title,p.amount_cents,p.guest_name,p.status,p.expires_at,
         s.pix_key,s.pix_receiver_name,s.pix_city
  from public.gift_payments p
  join public.gifts g on g.id=p.gift_id and g.wedding_id=p.wedding_id
  join public.wedding_private_settings s on s.wedding_id=p.wedding_id
  where p.checkout_token=p_checkout_token and p.deleted_at is null;
$$;
revoke all on function public.read_gift_pix_order(uuid) from public;
grant execute on function public.read_gift_pix_order(uuid) to anon,authenticated;

create or replace function public.review_gift_pix_payment(
  p_payment_id uuid, p_decision text, p_note text default null
)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_payment public.gift_payments%rowtype;
  v_gift public.gifts%rowtype;
  v_confirmed bigint;
begin
  if p_decision not in ('confirmed','rejected') or length(coalesce(p_note,''))>1000 then
    raise exception 'Revisao invalida';
  end if;
  -- Tranca o presente antes do pagamento para manter a mesma ordem do checkout.
  select * into v_payment from public.gift_payments where id=p_payment_id;
  if not found or v_payment.deleted_at is not null or
     not public.is_wedding_admin(v_payment.wedding_id) then
    raise exception 'Pagamento nao encontrado ou acesso negado';
  end if;
  if v_payment.gift_id is not null then
    perform pg_advisory_xact_lock(hashtextextended(v_payment.gift_id::text,0));
    select * into v_gift from public.gifts where id=v_payment.gift_id for update;
  end if;
  select * into v_payment from public.gift_payments where id=p_payment_id for update;
  if v_payment.status <> 'pending_confirmation' then
    raise exception 'Este pagamento ja foi revisado';
  end if;
  if p_decision='confirmed' and v_gift.availability_kind='limited' then
    select coalesce(sum(quantity),0) into v_confirmed from public.gift_payments
      where gift_id=v_payment.gift_id and status='confirmed' and deleted_at is null;
    if v_confirmed+v_payment.quantity > v_gift.quantity_total then
      raise exception 'Sem disponibilidade para confirmar este presente';
    end if;
  end if;
  update public.gift_payments set
    status=p_decision::public.payment_status,
    confirmed_at=case when p_decision='confirmed' then now() else null end,
    reviewed_by=auth.uid(),reviewed_at=now(),admin_note=nullif(btrim(coalesce(p_note,'')),'')
  where id=p_payment_id;
end;
$$;
revoke all on function public.review_gift_pix_payment(uuid,text,text) from public;
grant execute on function public.review_gift_pix_payment(uuid,text,text) to authenticated;

commit;
