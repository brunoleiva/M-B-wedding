-- Execute after 202610130001_initial_schema.sql.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('wedding-media','wedding-media',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "wedding admins upload media" on storage.objects for insert to authenticated
with check (bucket_id = 'wedding-media' and exists (
  select 1 from public.admin_memberships m
  where m.wedding_id::text = split_part(name,'/',1) and m.user_id = (select auth.uid()) and m.is_active
));
create policy "wedding admins delete media" on storage.objects for delete to authenticated
using (bucket_id = 'wedding-media' and exists (
  select 1 from public.admin_memberships m
  where m.wedding_id::text = split_part(name,'/',1) and m.user_id = (select auth.uid()) and m.is_active
));
