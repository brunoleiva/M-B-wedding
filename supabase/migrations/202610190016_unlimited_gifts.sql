-- Remove limites de quantidade dos presentes cadastrados, sem modificar pagamentos.
-- Aplicar após a migration 014. Mantém o esquema legado por compatibilidade.
BEGIN;
UPDATE public.gifts
SET availability_kind = 'unlimited', quantity_total = NULL
WHERE availability_kind IS DISTINCT FROM 'unlimited'
   OR quantity_total IS NOT NULL;
COMMIT;
