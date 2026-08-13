-- Script para atualizar a tabela 'cheotnun_products' com todas as colunas necessárias

ALTER TABLE cheotnun_products
  ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS price_brl NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_promo_brl NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS volume TEXT,
  ADD COLUMN IF NOT EXISTS weight NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hs_code TEXT;

-- Garantir que as colunas também existem nas categorias e marcas, caso tenham faltado
ALTER TABLE cheotnun_categories
  ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

ALTER TABLE cheotnun_brands
  ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

-- Recarregar o cache do schema do PostgREST (crucial para o erro sumir imediatamente)
NOTIFY pgrst, 'reload schema';
