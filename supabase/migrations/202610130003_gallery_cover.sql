-- Enforce one cover image per wedding, regardless of concurrent requests.
update public.gallery_images gi set is_cover = false
where gi.is_cover and gi.id <> (
 select gi2.id from public.gallery_images gi2 where gi2.wedding_id=gi.wedding_id and gi2.is_cover order by gi2.created_at, gi2.id limit 1
);
create unique index if not exists gallery_one_cover_per_wedding on public.gallery_images(wedding_id) where is_cover;
