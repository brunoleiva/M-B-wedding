-- Fases 8.2/8.3: metadados seguros para o catalogo publico.
-- Pre-requisito: migration 202610130009_gift_foundation.sql aplicada.
begin;
create or replace function public.get_public_gift_settings(target_wedding_id uuid)
returns table(enabled boolean, introduction text)
language sql stable security definer set search_path = '' as $$
  select coalesce(p.gifts_enabled,false),p.gift_intro
    from public.weddings w
    left join public.wedding_private_settings p on p.wedding_id=w.id
   where w.id=target_wedding_id and w.is_published=true
     and exists (select 1 from public.site_sections s where s.wedding_id=w.id and s.key='presentes' and s.is_enabled=true);
$$;
revoke all on function public.get_public_gift_settings(uuid) from public;
grant execute on function public.get_public_gift_settings(uuid) to anon,authenticated;
commit;
