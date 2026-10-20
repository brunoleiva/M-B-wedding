-- Fase 9.1: exclusao logica em todas as entidades editoriais.
-- Execute antes de publicar o codigo que utiliza deleted_at.
BEGIN;
ALTER TABLE public.story_events ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.schedule_events ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.special_people ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.recommended_hotels ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
CREATE INDEX IF NOT EXISTS story_events_active_idx ON public.story_events(wedding_id, sort_order) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS gallery_images_active_idx ON public.gallery_images(wedding_id, sort_order) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS venues_active_idx ON public.venues(wedding_id, created_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS schedule_events_active_idx ON public.schedule_events(wedding_id, starts_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS special_people_active_idx ON public.special_people(wedding_id, sort_order) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS faqs_active_idx ON public.faqs(wedding_id, sort_order) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS recommended_hotels_active_idx ON public.recommended_hotels(wedding_id, sort_order) WHERE deleted_at IS NULL;
-- RLS: nem mesmo consultas diretas de convidados devem ver registros excluidos.
DROP POLICY IF EXISTS "public reads story" ON public.story_events;
CREATE POLICY "public reads story" ON public.story_events FOR SELECT TO anon,authenticated
 USING (deleted_at IS NULL AND is_published AND EXISTS (SELECT 1 FROM public.weddings w WHERE w.id=wedding_id AND w.is_published));
DROP POLICY IF EXISTS "public reads venues" ON public.venues;
CREATE POLICY "public reads venues" ON public.venues FOR SELECT TO anon,authenticated
 USING (deleted_at IS NULL AND is_published AND EXISTS (SELECT 1 FROM public.weddings w WHERE w.id=wedding_id AND w.is_published));
DROP POLICY IF EXISTS "public reads schedule" ON public.schedule_events;
CREATE POLICY "public reads schedule" ON public.schedule_events FOR SELECT TO anon,authenticated
 USING (deleted_at IS NULL AND is_public AND EXISTS (SELECT 1 FROM public.weddings w WHERE w.id=wedding_id AND w.is_published));
DROP POLICY IF EXISTS "public reads gallery images" ON public.gallery_images;
CREATE POLICY "public reads gallery images" ON public.gallery_images FOR SELECT TO anon,authenticated
 USING (deleted_at IS NULL AND is_published AND EXISTS (SELECT 1 FROM public.weddings w WHERE w.id=wedding_id AND w.is_published));
DROP POLICY IF EXISTS "public reads special people" ON public.special_people;
CREATE POLICY "public reads special people" ON public.special_people FOR SELECT TO anon,authenticated
 USING (deleted_at IS NULL AND is_published AND EXISTS (SELECT 1 FROM public.weddings w WHERE w.id=wedding_id AND w.is_published));
DROP POLICY IF EXISTS "public reads faqs" ON public.faqs;
CREATE POLICY "public reads faqs" ON public.faqs FOR SELECT TO anon,authenticated
 USING (deleted_at IS NULL AND is_active AND EXISTS (SELECT 1 FROM public.weddings w WHERE w.id=wedding_id AND w.is_published));
DROP POLICY IF EXISTS "published hotels" ON public.recommended_hotels;
CREATE POLICY "published hotels" ON public.recommended_hotels FOR SELECT TO anon,authenticated
 USING (deleted_at IS NULL AND is_published AND EXISTS (SELECT 1 FROM public.weddings w WHERE w.id=wedding_id AND w.is_published));
-- Nao editar ou eleger imagem excluida como capa por meio da RPC.
CREATE OR REPLACE FUNCTION public.update_gallery_photo_atomic(
 p_image_id uuid,p_alt text,p_caption text,p_sort_order integer,
 p_is_cover boolean,p_is_published boolean
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_wedding uuid;
BEGIN
 SELECT wedding_id INTO v_wedding FROM public.gallery_images WHERE id=p_image_id AND deleted_at IS NULL;
 IF v_wedding IS NULL OR NOT public.is_wedding_admin(v_wedding) THEN
  RAISE EXCEPTION 'Imagem inexistente ou acesso negado';
 END IF;
 IF length(btrim(coalesce(p_alt,''))) NOT BETWEEN 1 AND 200 OR
    length(coalesce(p_caption,''))>500 OR p_sort_order NOT BETWEEN 0 AND 100000 OR
    p_is_cover IS NULL OR p_is_published IS NULL THEN
  RAISE EXCEPTION 'Dados da imagem invalidos';
 END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(v_wedding::text,51));
 IF p_is_cover THEN
  UPDATE public.gallery_images SET is_cover=false WHERE wedding_id=v_wedding AND is_cover=true AND id<>p_image_id;
 END IF;
 UPDATE public.gallery_images SET alt_text=btrim(p_alt),caption=p_caption,
  sort_order=p_sort_order,is_cover=p_is_cover,is_published=p_is_published
 WHERE id=p_image_id AND wedding_id=v_wedding AND deleted_at IS NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.update_gallery_photo_atomic(uuid,text,text,integer,boolean,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_gallery_photo_atomic(uuid,text,text,integer,boolean,boolean) TO authenticated;
COMMIT;
