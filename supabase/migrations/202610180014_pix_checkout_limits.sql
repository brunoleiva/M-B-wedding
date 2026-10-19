-- Fase 8.6: limites de criacao de pedidos Pix no banco.
-- Requer migrations 011 e 012. Idempotencia e reservas existentes preservadas.
-- A chave Pix continua estatica; o QR nao constitui cobranca bancaria unica.
BEGIN;

CREATE OR REPLACE FUNCTION public.create_gift_pix_order(
  p_gift_id uuid, p_guest_name text, p_message text, p_request_key uuid
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_gift public.gifts%rowtype;
  v_settings public.wedding_private_settings%rowtype;
  v_token uuid;
  v_reserved bigint;
  v_minutes integer;
  v_recent bigint;
BEGIN
  IF p_request_key IS NULL OR p_gift_id IS NULL
    OR length(btrim(coalesce(p_guest_name,''))) NOT BETWEEN 2 AND 160
    OR length(coalesce(p_message,'')) > 1000 THEN
    RAISE EXCEPTION 'Dados invalidos para o pedido';
  END IF;

  -- Serializa pedidos por casamento para aplicar o limite de forma transacional.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_gift_id::text, 0));
  SELECT * INTO v_gift FROM public.gifts
    WHERE id = p_gift_id AND is_active = true AND deleted_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Presente indisponivel'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(v_gift.wedding_id::text, 17));

  IF NOT EXISTS (SELECT 1 FROM public.weddings w WHERE w.id=v_gift.wedding_id AND w.is_published)
    OR NOT EXISTS (SELECT 1 FROM public.site_sections s WHERE s.wedding_id=v_gift.wedding_id
      AND s.key='presentes' AND s.is_enabled) THEN
    RAISE EXCEPTION 'Catalogo indisponivel';
  END IF;
  SELECT * INTO v_settings FROM public.wedding_private_settings
    WHERE wedding_id=v_gift.wedding_id;
  IF NOT FOUND OR v_settings.gifts_enabled IS NOT TRUE OR
    nullif(btrim(coalesce(v_settings.pix_key,'')),'') IS NULL OR
    nullif(btrim(coalesce(v_settings.pix_receiver_name,'')),'') IS NULL OR
    nullif(btrim(coalesce(v_settings.pix_city,'')),'') IS NULL THEN
    RAISE EXCEPTION 'Pix ainda nao configurado';
  END IF;

  -- Reenvios de uma mesma tentativa devem retornar o pedido original.
  SELECT checkout_token INTO v_token FROM public.gift_payments
    WHERE wedding_id=v_gift.wedding_id AND request_key=p_request_key;
  IF FOUND THEN RETURN v_token; END IF;

  -- Limites defensivos. Inclui pedidos arquivados para impedir reset do limite.
  SELECT count(*) INTO v_recent FROM public.gift_payments p
    WHERE p.wedding_id=v_gift.wedding_id AND p.created_at > now()-interval '1 hour';
  IF v_recent >= 300 THEN RAISE EXCEPTION 'Limite de pedidos excedido'; END IF;

  SELECT count(*) INTO v_recent FROM public.gift_payments p
    WHERE p.gift_id=v_gift.id AND lower(btrim(p.guest_name))=lower(btrim(p_guest_name))
      AND p.created_at > now()-interval '1 hour';
  IF v_recent >= 3 THEN RAISE EXCEPTION 'Limite de pedidos excedido'; END IF;

  IF v_gift.availability_kind='limited' THEN
    SELECT coalesce(sum(p.quantity),0) INTO v_reserved FROM public.gift_payments p
      WHERE p.gift_id=v_gift.id AND p.deleted_at IS NULL AND (
        p.status='confirmed' OR
        (p.status='pending_confirmation' AND p.expires_at > now())
      );
    IF v_reserved >= v_gift.quantity_total THEN RAISE EXCEPTION 'Presente esgotado'; END IF;
  END IF;

  v_minutes := coalesce(v_settings.gift_reservation_minutes,30);
  v_token := gen_random_uuid();
  INSERT INTO public.gift_payments(
    wedding_id,gift_id,guest_name,amount_cents,message,status,
    quantity,request_key,checkout_token,expires_at
  ) VALUES (
    v_gift.wedding_id,v_gift.id,btrim(p_guest_name),v_gift.amount_cents,
    nullif(btrim(coalesce(p_message,'')),''),'pending_confirmation',
    1,p_request_key,v_token,now()+make_interval(mins=>v_minutes)
  );
  RETURN v_token;
END;
$$;
REVOKE ALL ON FUNCTION public.create_gift_pix_order(uuid,text,text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_gift_pix_order(uuid,text,text,uuid) TO anon,authenticated;
COMMIT;
