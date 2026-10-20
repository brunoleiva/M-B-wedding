-- Amplia o limite do bucket wedding-media para 20 MiB por imagem.
-- O limite global de upload do projeto Supabase tambem deve permitir 20 MiB.
UPDATE storage.buckets
SET file_size_limit = 20971520
WHERE id = 'wedding-media';

SELECT id, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'wedding-media';
