-- QA: troca de capa e edicao da foto em uma unica transacao.
-- Execute no Supabase SQL Editor antes de publicar a alteracao da galeria.
BEGIN;
CREATE OR REPLACE FUNCTION public.update_gallery_photo_atomic(
 p_image_id uuid,p_alt text,p_caption text,p_sort_order integer,
 p_is_cover boolean,p_is_published boolean
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_wedding uuid;
BEGIN
 SELECT wedding_id INTO v_wedding FROM public.gallery_images WHERE id=p_image_id;
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
 WHERE id=p_image_id AND wedding_id=v_wedding;
END;
$$;
REVOKE ALL ON FUNCTION public.update_gallery_photo_atomic(uuid,text,text,integer,boolean,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_gallery_photo_atomic(uuid,text,text,integer,boolean,boolean) TO authenticated;
COMMIT;
