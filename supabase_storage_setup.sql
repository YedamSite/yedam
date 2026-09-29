-- =============================================================================
-- CHEOTNUN — Permissões de upload no Supabase Storage
-- =============================================================================
-- POR QUE ISSO É NECESSÁRIO
-- O bucket 'cheotnun-images' existe e é público, mas o upload feito pelo painel
-- de administrador é rejeitado pelo banco com:
--     403  new row violates row-level security policy  (code: AccessDenied)
-- Consequência: todo upload cai no fallback base64 (data: URL) e a imagem fica
-- embutida dentro do registro no Postgres.
--
-- SEGURANÇA / O QUE ESSE SCRIPT NÃO FAZ
--   * Não apaga, altera nem migra nenhum dado seu.
--   * Não toca em cheotnun_products, cheotnun_categories, cheotnun_brands,
--     pedidos, blog, site_content nem nas imagens já existentes.
--   * As políticas antigas são removidas e recriadas com o MESMO efeito, apenas
--     desta vez efetivamente aplicadas (o arquivo original nunca rodou no projeto).
--   * É idempotente: pode rodar quantas vezes quiser.
--
-- COMO RODAR
--   Supabase Dashboard → SQL Editor → New query → colar → Run
--   (ou: psql "$SUPABASE_DB_URL" -f supabase_storage_setup.sql)
-- =============================================================================

-- 1. Garante que o bucket exista e seja público para leitura.
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('cheotnun-images', 'cheotnun-images', true, 10485760) -- 10 MB
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760;

-- 2. Limpa políticas anteriores deste bucket (idempotência).
DROP POLICY IF EXISTS "cheotnun_images_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "cheotnun_images_admin_insert"  ON storage.objects;
DROP POLICY IF EXISTS "cheotnun_images_admin_update"  ON storage.objects;
DROP POLICY IF EXISTS "cheotnun_images_admin_delete"  ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura publica"       ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload geral"           ON storage.objects;
DROP POLICY IF EXISTS "Permitir update geral"           ON storage.objects;
DROP POLICY IF EXISTS "Permitir delete geral"           ON storage.objects;

-- 3. Leitura pública — o site precisa exibir as imagens para qualquer visitante.
CREATE POLICY "cheotnun_images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cheotnun-images');

-- 4. Escrita (upload / substituição / remoção).
--    INSERT: o painel precisa subir a imagem nova.
--    UPDATE: a policy de upload usa cacheControl; sem UPDATE a escrita falha.
--    DELETE: o painel remove a imagem anterior quando ela é trocada.
--
--    Restrito ao bucket do projeto — nenhuma outra tabela de storage é afetada.
CREATE POLICY "cheotnun_images_admin_insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'cheotnun-images');

CREATE POLICY "cheotnun_images_admin_update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'cheotnun-images')
WITH CHECK (bucket_id = 'cheotnun-images');

CREATE POLICY "cheotnun_images_admin_delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'cheotnun-images');

-- 5. Verificação — deve retornar 4 linhas.
--    Se retornar 0, o upload pelo painel continuará caindo em base64.
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE 'cheotnun_images_%'
ORDER BY policyname;
