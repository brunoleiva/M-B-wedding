-- Consolida no repositório a correção dos gatilhos das tabelas de presentes.
-- Seguro para executar novamente; não modifica os registros existentes.
BEGIN;

CREATE OR REPLACE FUNCTION public.validate_gift_category_ref()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.category_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.gift_categories c
    WHERE c.id = NEW.category_id AND c.wedding_id = NEW.wedding_id
  ) THEN
    RAISE EXCEPTION 'Categoria pertence a outro casamento';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_gift_payment_ref()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.gift_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.gifts g
    WHERE g.id = NEW.gift_id AND g.wedding_id = NEW.wedding_id
  ) THEN
    RAISE EXCEPTION 'Presente pertence a outro casamento';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gifts_wedding_refs ON public.gifts;
CREATE TRIGGER gifts_wedding_refs
BEFORE INSERT OR UPDATE OF category_id, wedding_id ON public.gifts
FOR EACH ROW EXECUTE FUNCTION public.validate_gift_category_ref();

DROP TRIGGER IF EXISTS payments_wedding_refs ON public.gift_payments;
CREATE TRIGGER payments_wedding_refs
BEFORE INSERT OR UPDATE OF gift_id, wedding_id ON public.gift_payments
FOR EACH ROW EXECUTE FUNCTION public.validate_gift_payment_ref();

REVOKE ALL ON FUNCTION public.validate_gift_category_ref() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validate_gift_payment_ref() FROM PUBLIC;

-- A função legada usava NEW.category_id mesmo em pagamentos, causando 42703.
-- Os gatilhos legados acima já foram substituídos.
DROP FUNCTION IF EXISTS public.validate_gift_wedding_refs();
COMMIT;
