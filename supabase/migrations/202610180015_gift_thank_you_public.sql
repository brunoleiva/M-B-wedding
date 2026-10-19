-- Fase 8.7: mensagem de agradecimento publica apenas ao portador de um pedido confirmado.
-- Não expõe a chave Pix ou outras configurações privadas.
begin;
create or replace function public.read_confirmed_gift_thank_you(p_checkout_token uuid)
returns text
language sql stable security definer set search_path = ''
as $$
  select nullif(btrim(s.gift_thank_you), '')
  from public.gift_payments p
  join public.wedding_private_settings s on s.wedding_id = p.wedding_id
  where p.checkout_token = p_checkout_token
    and p.status = 'confirmed'
    and p.deleted_at is null
  limit 1;
$$;
revoke all on function public.read_confirmed_gift_thank_you(uuid) from public;
grant execute on function public.read_confirmed_gift_thank_you(uuid) to anon, authenticated;
commit;
