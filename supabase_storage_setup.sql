-- Cria o bucket 'cheotnun-images' se ele não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('cheotnun-images', 'cheotnun-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Remove políticas antigas caso existam para evitar duplicidade
DROP POLICY IF EXISTS "Permitir leitura publica" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload geral" ON storage.objects;
DROP POLICY IF EXISTS "Permitir delete geral" ON storage.objects;

-- Política 1: Permitir que qualquer pessoa LEIA as imagens (visualizar no site)
CREATE POLICY "Permitir leitura publica"
ON storage.objects FOR SELECT
USING ( bucket_id = 'cheotnun-images' );

-- Política 2: Permitir que qualquer pessoa FAÇA UPLOAD (inserir) de imagens pro bucket
CREATE POLICY "Permitir upload geral"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'cheotnun-images' );

-- Política 3: Permitir que qualquer pessoa DELETE imagens do bucket (quando substituir)
CREATE POLICY "Permitir delete geral"
ON storage.objects FOR DELETE
USING ( bucket_id = 'cheotnun-images' );

-- Política 4: Permitir que qualquer pessoa ATUALIZE imagens do bucket
CREATE POLICY "Permitir update geral"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'cheotnun-images' );
