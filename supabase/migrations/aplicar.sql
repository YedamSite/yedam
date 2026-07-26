-- ============================================================
-- aplicar.sql
-- Migration segura - adiciona colunas faltantes sem recriar
-- Pode executar quantas vezes quiser (IF NOT EXISTS)
-- ============================================================

-- 1. system_settings (site_content, visual_theme, etc.)
CREATE TABLE IF NOT EXISTS cheotnun_system_settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- 2. categorias
CREATE TABLE IF NOT EXISTS cheotnun_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  image       TEXT DEFAULT '',
  translations JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. marcas
CREATE TABLE IF NOT EXISTS cheotnun_brands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  logo_url    TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT FALSE,
  translations JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. produtos
CREATE TABLE IF NOT EXISTS cheotnun_products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku            TEXT UNIQUE NOT NULL,
  name           TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  description    TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  price          DECIMAL(10,2) NOT NULL,
  price_promo    DECIMAL(10,2),
  price_brl      DECIMAL(10,2),
  price_promo_brl DECIMAL(10,2),
  stock          INTEGER DEFAULT 0,
  weight         DECIMAL(8,3) DEFAULT 0,
  volume         TEXT DEFAULT '',
  hs_code        TEXT DEFAULT '',
  status         TEXT DEFAULT 'active',
  brand_id       UUID REFERENCES cheotnun_brands(id),
  category_id    UUID REFERENCES cheotnun_categories(id),
  image          TEXT DEFAULT '',
  translations   JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- colunas BRL para tabela existente
ALTER TABLE cheotnun_products ADD COLUMN IF NOT EXISTS price_brl       DECIMAL(10,2);
ALTER TABLE cheotnun_products ADD COLUMN IF NOT EXISTS price_promo_brl DECIMAL(10,2);

-- 5. imagens de produtos
CREATE TABLE IF NOT EXISTS cheotnun_product_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES cheotnun_products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  is_main    BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0
);

-- 6. blog posts
CREATE TABLE IF NOT EXISTS cheotnun_blog_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  subtitle        TEXT DEFAULT '',
  content         TEXT DEFAULT '',
  image           TEXT DEFAULT '',
  author          TEXT DEFAULT '',
  seo_title       TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  status          TEXT DEFAULT 'draft'
);

-- 7. CMS blocks
CREATE TABLE IF NOT EXISTS cheotnun_cms_blocks (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type  TEXT NOT NULL,
  title TEXT DEFAULT '',
  content JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

-- 8. pedidos (se ja existe, adiciona colunas faltantes)
CREATE TABLE IF NOT EXISTS cheotnun_orders (
  id              VARCHAR(255) PRIMARY KEY,
  customer_id     UUID,
  status          VARCHAR(50) NOT NULL DEFAULT 'pending',
  subtotal        NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_amount    NUMERIC(10,2) NOT NULL DEFAULT 0,
  gateway         VARCHAR(100),
  items           JSONB DEFAULT '[]'::jsonb,
  shipping_address JSONB DEFAULT '{}'::jsonb,
  billing_address  JSONB DEFAULT '{}'::jsonb,
  carrier         VARCHAR(100),
  tracking_code   VARCHAR(100),
  document_type   VARCHAR(20),
  document_number VARCHAR(100),
  commercial_invoice_url TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cheotnun_orders ADD COLUMN IF NOT EXISTS user_id           TEXT DEFAULT '';
ALTER TABLE cheotnun_orders ADD COLUMN IF NOT EXISTS total             DECIMAL(10,2) DEFAULT 0;
ALTER TABLE cheotnun_orders ADD COLUMN IF NOT EXISTS shipping_cost     DECIMAL(10,2) DEFAULT 0;
ALTER TABLE cheotnun_orders ADD COLUMN IF NOT EXISTS currency          TEXT DEFAULT 'USD';
ALTER TABLE cheotnun_orders ADD COLUMN IF NOT EXISTS shipping_method   TEXT DEFAULT '';
ALTER TABLE cheotnun_orders ADD COLUMN IF NOT EXISTS shipping_zone     TEXT DEFAULT '';
ALTER TABLE cheotnun_orders ADD COLUMN IF NOT EXISTS notes             TEXT DEFAULT '';
ALTER TABLE cheotnun_orders ADD COLUMN IF NOT EXISTS payment_method    TEXT DEFAULT '';
ALTER TABLE cheotnun_orders ADD COLUMN IF NOT EXISTS payment_status    TEXT DEFAULT 'pending';
ALTER TABLE cheotnun_orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT DEFAULT '';

-- 9. order tracking
CREATE TABLE IF NOT EXISTS cheotnun_order_tracking (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   VARCHAR(255) REFERENCES cheotnun_orders(id) ON DELETE CASCADE,
  status     TEXT NOT NULL,
  message    TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. comunicação
CREATE TABLE IF NOT EXISTS cheotnun_communication_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   VARCHAR(255) REFERENCES cheotnun_orders(id) ON DELETE SET NULL,
  type       TEXT NOT NULL,
  subject    TEXT DEFAULT '',
  message    TEXT DEFAULT '',
  recipient  TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. usuários
CREATE TABLE IF NOT EXISTS cheotnun_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  name            TEXT DEFAULT '',
  phone           TEXT DEFAULT '',
  document        TEXT DEFAULT '',
  avatar_url      TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 12. newsletter subscribers
CREATE TABLE IF NOT EXISTS cheotnun_newsletter_subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  name       TEXT DEFAULT '',
  locale     TEXT DEFAULT 'es',
  active     BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. subscriptions
CREATE TABLE IF NOT EXISTS cheotnun_subscriptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  status     TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. routines
CREATE TABLE IF NOT EXISTS cheotnun_routines (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT NOT NULL,
  slug  TEXT UNIQUE NOT NULL,
  items JSONB DEFAULT '[]',
  translations JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Índices
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_brand    ON cheotnun_products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON cheotnun_products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status   ON cheotnun_products(status);
CREATE INDEX IF NOT EXISTS idx_orders_user       ON cheotnun_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON cheotnun_orders(status);
CREATE INDEX IF NOT EXISTS idx_tracking_order    ON cheotnun_order_tracking(order_id);
