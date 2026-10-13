-- Token-only RSVP API: never grant visitors direct table access.
create or replace function public.invitation_details(invite_token text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare g public.guest_groups%rowtype;
begin
  if invite_token !~ '^[0-9a-f]{48}$' then return null; end if;
  select * into g from public.guest_groups where invitation_token = invite_token and deleted_at is null;
  if not found or not exists (select 1 from public.weddings where id = g.wedding_id and is_published) then return null; end if;
  return jsonb_build_object('family',g.display_name,'guests',(
    select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',full_name,'status',rsvp_status,'kind',kind,'dietary',dietary_restrictions,'note',guest_note) order by created_at), '[]'::jsonb)
    from public.guests where guest_group_id=g.id and wedding_id=g.wedding_id and deleted_at is null
  ));
end $$;

create or replace function public.respond_to_invitation(invite_token text, responses jsonb)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare g public.guest_groups%rowtype; item jsonb; target uuid; proposed text; affected integer; item_count integer;
begin
  if invite_token !~ '^[0-9a-f]{48}$' or jsonb_typeof(responses) is distinct from 'array' then return false; end if;
  item_count := jsonb_array_length(responses);
  if item_count < 1 or item_count > 30 then return false; end if;
  select * into g from public.guest_groups where invitation_token = invite_token and deleted_at is null;
  if not found or not exists (select 1 from public.weddings where id=g.wedding_id and is_published) then return false; end if;
  -- Accept exactly one response per existing guest. No creating new people.
  if item_count <> (select count(*) from public.guests where guest_group_id=g.id and wedding_id=g.wedding_id and deleted_at is null) then return false; end if;
  if (select count(distinct x->>'id') from jsonb_array_elements(responses) x) <> item_count then return false; end if;
  for item in select value from jsonb_array_elements(responses) loop
    if jsonb_typeof(item) <> 'object' or (item->>'id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then return false; end if;
    proposed := item->>'status';
    if proposed not in ('attending','not_attending') or length(coalesce(item->>'dietary','')) > 500 or length(coalesce(item->>'note','')) > 1000 then return false; end if;
    target := (item->>'id')::uuid;
    if not exists (select 1 from public.guests where id=target and wedding_id=g.wedding_id and guest_group_id=g.id and deleted_at is null) then return false; end if;
  end loop;
  for item in select value from jsonb_array_elements(responses) loop
    update public.guests set rsvp_status=(item->>'status')::public.rsvp_status,
      dietary_restrictions=nullif(btrim(coalesce(item->>'dietary','')),''),
      guest_note=nullif(btrim(coalesce(item->>'note','')),''), responded_at=now()
      where id=(item->>'id')::uuid and guest_group_id=g.id and wedding_id=g.wedding_id and deleted_at is null;
    get diagnostics affected = row_count;
    if affected <> 1 then raise exception 'invalid guest'; end if;
  end loop;
  return true;
end $$;
revoke all on function public.invitation_details(text) from public;
revoke all on function public.respond_to_invitation(text,jsonb) from public;
grant execute on function public.invitation_details(text) to anon, authenticated;
grant execute on function public.respond_to_invitation(text,jsonb) to anon, authenticated;
