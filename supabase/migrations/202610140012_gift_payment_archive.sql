-- Arquivamento administrativo auditavel; preserva as linhas e os eventos.
begin;
create or replace function public.archive_gift_pix_payment(p_payment_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_payment public.gift_payments%rowtype;
begin
  select * into v_payment from public.gift_payments where id=p_payment_id for update;
  if not found or v_payment.deleted_at is not null or
     not public.is_wedding_admin(v_payment.wedding_id) then
    raise exception 'Pagamento nao encontrado ou acesso negado';
  end if;

  insert into public.gift_payment_events
    (wedding_id, payment_id, actor_user_id, event_type, previous_status, next_status, details)
  values
    (v_payment.wedding_id,v_payment.id,auth.uid(),'note',v_payment.status,v_payment.status,'Pagamento arquivado no painel administrativo');

  update public.gift_payments set deleted_at=now() where id=v_payment.id;
end;
$$;
revoke all on function public.archive_gift_pix_payment(uuid) from public;
grant execute on function public.archive_gift_pix_payment(uuid) to authenticated;
commit;
