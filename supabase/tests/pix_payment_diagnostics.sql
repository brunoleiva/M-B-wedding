-- Diagnóstico somente leitura. Execute no SQL Editor do Supabase.
-- Não exibe chave Pix nem nomes dos convidados.
SELECT 'checkout_rpc' AS check_name,
       to_regprocedure('public.create_gift_pix_order(uuid,text,text,uuid)') IS NOT NULL AS ok
UNION ALL SELECT 'read_rpc', to_regprocedure('public.read_gift_pix_order(uuid)') IS NOT NULL
UNION ALL SELECT 'review_rpc', to_regprocedure('public.review_gift_pix_payment(uuid,text,text)') IS NOT NULL
UNION ALL SELECT 'archive_rpc', to_regprocedure('public.archive_gift_pix_payment(uuid)') IS NOT NULL
UNION ALL SELECT 'gift_category_trigger', EXISTS (
 SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
 JOIN pg_proc p ON p.oid=t.tgfoid
 WHERE c.oid='public.gifts'::regclass AND t.tgname='gifts_wedding_refs'
 AND p.proname='validate_gift_category_ref' AND NOT t.tgisinternal
)
UNION ALL SELECT 'gift_payment_trigger', EXISTS (
 SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
 JOIN pg_proc p ON p.oid=t.tgfoid
 WHERE c.oid='public.gift_payments'::regclass AND t.tgname='payments_wedding_refs'
 AND p.proname='validate_gift_payment_ref' AND NOT t.tgisinternal
);

SELECT status, COUNT(*) AS total, COALESCE(SUM(amount_cents),0) AS valor_centavos
FROM public.gift_payments
WHERE deleted_at IS NULL
GROUP BY status ORDER BY status;

SELECT COUNT(*) AS pagamentos_sem_presente
FROM public.gift_payments p
LEFT JOIN public.gifts g ON g.id=p.gift_id AND g.wedding_id=p.wedding_id
WHERE p.gift_id IS NOT NULL AND g.id IS NULL;
