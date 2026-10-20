-- Fase 9.3: diagnostico sem escrita. Executar no SQL Editor apos migration 018.
-- Deve retornar sete linhas com coluna presente e RLS habilitada.
SELECT t.table_name,
       EXISTS (SELECT 1 FROM information_schema.columns c WHERE c.table_schema = 'public' AND c.table_name = t.table_name AND c.column_name = 'deleted_at') AS has_deleted_at,
       c.relrowsecurity AS rls_enabled,
       (SELECT count(*) FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=t.table_name AND p.qual LIKE '%deleted_at%') AS policies_filter_deleted
FROM (VALUES ('story_events'),('gallery_images'),('venues'),('schedule_events'),('special_people'),('faqs'),('recommended_hotels')) AS t(table_name)
JOIN pg_class c ON c.oid = to_regclass('public.' || t.table_name)
ORDER BY t.table_name;
-- Resultado esperado: has_deleted_at=true, rls_enabled=true, policies_filter_deleted>=1 em todas.
-- A existencia da coluna nao verifica por si so que o deploy/uso dos formulários funciona.
