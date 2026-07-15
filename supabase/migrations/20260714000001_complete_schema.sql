-- =============================================================================
-- CHEOTNUN K-BEAUTY — COMPLETE DATABASE SCHEMA
-- =============================================================================
-- Este SQL cria TODO o banco de dados do zero:
-- 1. DROP de todas as tabelas antigas (yedam_* e cheotnun_*)
-- 2. Criação de todas as tabelas com campos completos
-- 3. Dados iniciais (seed)
-- 4. Políticas de segurança (RLS)
-- 5. Índices de performance
-- =============================================================================

-- =============================================================================
-- STEP 1: DROP EVERYTHING (remove tabelas antigas yedam_ e cheotnun_)
-- =============================================================================
DROP TABLE IF EXISTS cheotnun_subscription_payments CASCADE;
DROP TABLE IF EXISTS cheotnun_subscriptions CASCADE;
DROP TABLE IF EXISTS cheotnun_subscription_plans CASCADE;
DROP TABLE IF EXISTS cheotnun_communication_logs CASCADE;
DROP TABLE IF EXISTS cheotnun_order_tracking CASCADE;
DROP TABLE IF EXISTS cheotnun_order_items CASCADE;
DROP TABLE IF EXISTS cheotnun_orders CASCADE;
DROP TABLE IF EXISTS cheotnun_favorites CASCADE;
DROP TABLE IF EXISTS cheotnun_product_images CASCADE;
DROP TABLE IF EXISTS cheotnun_products CASCADE;
DROP TABLE IF EXISTS cheotnun_brands CASCADE;
DROP TABLE IF EXISTS cheotnun_categories CASCADE;
DROP TABLE IF EXISTS cheotnun_coupons CASCADE;
DROP TABLE IF EXISTS cheotnun_routines CASCADE;
DROP TABLE IF EXISTS cheotnun_cms_blocks CASCADE;
DROP TABLE IF EXISTS cheotnun_site_content CASCADE;
DROP TABLE IF EXISTS cheotnun_blog_posts CASCADE;
DROP TABLE IF EXISTS cheotnun_newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS cheotnun_addresses CASCADE;
DROP TABLE IF EXISTS cheotnun_users CASCADE;
DROP TABLE IF EXISTS cheotnun_system_settings CASCADE;

DROP TABLE IF EXISTS yedam_subscription_payments CASCADE;
DROP TABLE IF EXISTS yedam_subscriptions CASCADE;
DROP TABLE IF EXISTS yedam_subscription_plans CASCADE;
DROP TABLE IF EXISTS yedam_communication_logs CASCADE;
DROP TABLE IF EXISTS yedam_order_tracking CASCADE;
DROP TABLE IF EXISTS yedam_order_items CASCADE;
DROP TABLE IF EXISTS yedam_orders CASCADE;
DROP TABLE IF EXISTS yedam_favorites CASCADE;
DROP TABLE IF EXISTS yedam_product_images CASCADE;
DROP TABLE IF EXISTS yedam_products CASCADE;
DROP TABLE IF EXISTS yedam_brands CASCADE;
DROP TABLE IF EXISTS yedam_categories CASCADE;
DROP TABLE IF EXISTS yedam_routines CASCADE;
DROP TABLE IF EXISTS yedam_cms_blocks CASCADE;
DROP TABLE IF EXISTS yedam_site_content CASCADE;
DROP TABLE IF EXISTS yedam_blog_posts CASCADE;
DROP TABLE IF EXISTS yedam_newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS yedam_addresses CASCADE;
DROP TABLE IF EXISTS yedam_users CASCADE;
DROP TABLE IF EXISTS yedam_system_settings CASCADE;

DROP TYPE IF EXISTS user_role_yedam CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;

-- =============================================================================
-- STEP 2: CREATE ALL TABLES
-- =============================================================================

-- --------------------------------------------------
-- 2.1 SYSTEM SETTINGS (configurações chave-valor)
-- --------------------------------------------------
CREATE TABLE cheotnun_system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL
);

-- --------------------------------------------------
-- 2.2 USERS (perfis dos usuários, vinculados ao Supabase Auth)
-- --------------------------------------------------
CREATE TABLE cheotnun_users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100),
    document_type VARCHAR(20),
    document_number VARCHAR(100),
    postal_code VARCHAR(50),
    street VARCHAR(255),
    number VARCHAR(50),
    complement VARCHAR(150),
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------
-- 2.3 ADDRESSES (endereços dos usuários)
-- --------------------------------------------------
CREATE TABLE cheotnun_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES cheotnun_users(id) ON DELETE CASCADE,
    address_type VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    street VARCHAR(255) NOT NULL,
    number VARCHAR(50) NOT NULL,
    complement VARCHAR(150),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    document_type VARCHAR(20),
    document_number VARCHAR(100)
);

-- --------------------------------------------------
-- 2.4 CATEGORIES (categorias de produtos)
-- --------------------------------------------------
CREATE TABLE cheotnun_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    translations JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------
-- 2.5 BRANDS (marcas de produtos)
-- --------------------------------------------------
CREATE TABLE cheotnun_brands (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    translations JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------
-- 2.6 PRODUCTS (produtos)
-- --------------------------------------------------
CREATE TABLE cheotnun_products (
    id UUID PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    description_en TEXT,
    price NUMERIC(10, 2) NOT NULL,
    price_promo NUMERIC(10, 2),
    weight NUMERIC(10, 2),
    volume VARCHAR(50),
    stock INT NOT NULL DEFAULT 0,
    hs_code VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    brand_id UUID REFERENCES cheotnun_brands(id) ON DELETE SET NULL,
    category_id UUID REFERENCES cheotnun_categories(id) ON DELETE SET NULL,
    image TEXT,
    translations JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------
-- 2.7 PRODUCT IMAGES (galeria de imagens dos produtos)
-- --------------------------------------------------
CREATE TABLE cheotnun_product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES cheotnun_products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0
);

-- --------------------------------------------------
-- 2.8 BLOG POSTS
-- --------------------------------------------------
CREATE TABLE cheotnun_blog_posts (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    subtitle TEXT,
    content TEXT,
    image TEXT,
    author TEXT DEFAULT 'Cheotnun Editor',
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    language VARCHAR(5) DEFAULT 'es',
    status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
    translations JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------
-- 2.9 SITE CONTENT (textos do site: home, header, footer)
-- --------------------------------------------------
CREATE TABLE cheotnun_site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_name VARCHAR(100) NOT NULL,
    section_key VARCHAR(255) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    translations JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_name, section_key)
);

-- --------------------------------------------------
-- 2.10 CMS BLOCKS (blocos reutilizáveis)
-- --------------------------------------------------
CREATE TABLE cheotnun_cms_blocks (
    id VARCHAR(255) PRIMARY KEY,
    page_name VARCHAR(100) NOT NULL,
    section_id VARCHAR(100) NOT NULL,
    block_type VARCHAR(100) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    translations JSONB DEFAULT '{}'::jsonb,
    sort_order INT NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

-- --------------------------------------------------
-- 2.11 ROUTINES (rotinas de skincare)
-- --------------------------------------------------
CREATE TABLE cheotnun_routines (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    skin_type VARCHAR(100) NOT NULL,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    video_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    translations JSONB DEFAULT '{}'::jsonb
);

-- --------------------------------------------------
-- 2.12 ORDERS (pedidos)
-- --------------------------------------------------
CREATE TABLE cheotnun_orders (
    id VARCHAR(255) PRIMARY KEY,
    customer_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    gateway VARCHAR(100) NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    carrier VARCHAR(100),
    tracking_code VARCHAR(100),
    document_type VARCHAR(20),
    document_number VARCHAR(100),
    commercial_invoice_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------
-- 2.13 ORDER ITEMS (itens do pedido)
-- --------------------------------------------------
CREATE TABLE cheotnun_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(255) REFERENCES cheotnun_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES cheotnun_products(id) ON DELETE SET NULL,
    name VARCHAR(255),
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL
);

-- --------------------------------------------------
-- 2.14 ORDER TRACKING (histórico de status do pedido)
-- --------------------------------------------------
CREATE TABLE cheotnun_order_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(255) REFERENCES cheotnun_orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    tracking_code VARCHAR(100),
    carrier VARCHAR(100),
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------
-- 2.15 COMMUNICATION LOGS (emails enviados + chat messages)
-- --------------------------------------------------
CREATE TABLE cheotnun_communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50),
    sender VARCHAR(50),
    sender_name VARCHAR(255),
    sender_email VARCHAR(255),
    user_id VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    read BOOLEAN DEFAULT FALSE,
    recipient VARCHAR(255),
    subject VARCHAR(255),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------
-- 2.16 FAVORITES (favoritos dos usuários)
-- --------------------------------------------------
CREATE TABLE cheotnun_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES cheotnun_users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES cheotnun_products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- --------------------------------------------------
-- 2.17 COUPONS (cupons de desconto)
-- --------------------------------------------------
CREATE TABLE cheotnun_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount NUMERIC(10, 2) NOT NULL,
    type VARCHAR(50) DEFAULT 'fixed',
    status VARCHAR(50) DEFAULT 'active'
);

-- --------------------------------------------------
-- 2.18 NEWSLETTER SUBSCRIBERS
-- --------------------------------------------------
CREATE TABLE cheotnun_newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    source VARCHAR(100) DEFAULT 'homepage',
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------
-- 2.19 SUBSCRIPTION PLANS (planos de assinatura)
-- --------------------------------------------------
CREATE TABLE cheotnun_subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    interval VARCHAR(50) DEFAULT 'monthly',
    description TEXT,
    features TEXT[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------
-- 2.20 SUBSCRIPTIONS (assinaturas dos usuários)
-- --------------------------------------------------
CREATE TABLE cheotnun_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES cheotnun_users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES cheotnun_subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------
-- 2.21 SUBSCRIPTION PAYMENTS (pagamentos de assinatura)
-- --------------------------------------------------
CREATE TABLE cheotnun_subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES cheotnun_subscriptions(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    invoice_url TEXT,
    payment_date TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STEP 3: INDEXES (índices para performance)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_cheotnun_products_slug ON cheotnun_products(slug);
CREATE INDEX IF NOT EXISTS idx_cheotnun_products_category ON cheotnun_products(category_id);
CREATE INDEX IF NOT EXISTS idx_cheotnun_products_brand ON cheotnun_products(brand_id);
CREATE INDEX IF NOT EXISTS idx_cheotnun_products_status ON cheotnun_products(status);
CREATE INDEX IF NOT EXISTS idx_cheotnun_blog_posts_slug ON cheotnun_blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_cheotnun_blog_posts_status ON cheotnun_blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_cheotnun_orders_customer ON cheotnun_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_cheotnun_orders_status ON cheotnun_orders(status);
CREATE INDEX IF NOT EXISTS idx_cheotnun_order_items_order ON cheotnun_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cheotnun_favorites_user ON cheotnun_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_cheotnun_addresses_user ON cheotnun_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_cheotnun_communication_logs_order ON cheotnun_communication_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_cheotnun_communication_logs_type ON cheotnun_communication_logs(type);
CREATE INDEX IF NOT EXISTS idx_cheotnun_subscriptions_user ON cheotnun_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_cheotnun_coupons_code ON cheotnun_coupons(code);
CREATE INDEX IF NOT EXISTS idx_cheotnun_newsletter_email ON cheotnun_newsletter_subscribers(email);

-- =============================================================================
-- STEP 4: ROW LEVEL SECURITY (RLS) — permissões
-- =============================================================================
-- Todas as tabelas (leitura pública)
ALTER TABLE cheotnun_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_cms_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_system_settings ENABLE ROW LEVEL SECURITY;

-- Tabelas com acesso misto
ALTER TABLE cheotnun_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_subscription_payments ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública
CREATE POLICY "Public read categories" ON cheotnun_categories FOR SELECT USING (true);
CREATE POLICY "Public read brands" ON cheotnun_brands FOR SELECT USING (true);
CREATE POLICY "Public read products" ON cheotnun_products FOR SELECT USING (true);
CREATE POLICY "Public read site content" ON cheotnun_site_content FOR SELECT USING (true);
CREATE POLICY "Public read cms blocks" ON cheotnun_cms_blocks FOR SELECT USING (true);
CREATE POLICY "Public read routines" ON cheotnun_routines FOR SELECT USING (true);
CREATE POLICY "Public read system settings" ON cheotnun_system_settings FOR SELECT USING (true);
CREATE POLICY "Public read coupons" ON cheotnun_coupons FOR SELECT USING (true);
CREATE POLICY "Public read subscription plans" ON cheotnun_subscription_plans FOR SELECT USING (true);

-- Blog: qualquer um lê publicado; admin gerencia tudo
CREATE POLICY "Read published posts" ON cheotnun_blog_posts FOR SELECT USING (status = 'published');

-- Newsletter: qualquer um pode se inscrever
CREATE POLICY "Anyone can subscribe" ON cheotnun_newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read newsletter" ON cheotnun_newsletter_subscribers FOR SELECT USING (true);

-- Usuários: acesso próprio
CREATE POLICY "Users read own" ON cheotnun_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own" ON cheotnun_users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own" ON cheotnun_users FOR UPDATE USING (auth.uid() = id);

-- Endereços: acesso próprio
CREATE POLICY "Users manage own addresses" ON cheotnun_addresses FOR ALL USING (auth.uid() = user_id);

-- Pedidos: clientes veem próprios
CREATE POLICY "Users read own orders" ON cheotnun_orders FOR SELECT USING (auth.uid() = customer_id);

-- Favoritos: acesso próprio
CREATE POLICY "Users manage own favorites" ON cheotnun_favorites FOR ALL USING (auth.uid() = user_id);

-- Communication logs: leitura pública (chat), insert público
CREATE POLICY "Public read communication logs" ON cheotnun_communication_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert communication" ON cheotnun_communication_logs FOR INSERT WITH CHECK (true);

-- Assinaturas: acesso próprio
CREATE POLICY "Users read own subscriptions" ON cheotnun_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own payments" ON cheotnun_subscription_payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM cheotnun_subscriptions s WHERE s.id = subscription_id AND s.user_id = auth.uid())
);

-- --------------------------------------------------
-- POLÍTICAS ADICIONAIS PARA O SISTEMA DE PEDIDOS
-- --------------------------------------------------

-- Pedidos: permite que o cliente crie seus próprios pedidos
CREATE POLICY "Users can insert own orders" ON cheotnun_orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Pedidos: permite que admins atualizem qualquer pedido
CREATE POLICY "Admin can update orders" ON cheotnun_orders
  FOR UPDATE USING (
    auth.jwt() ->> 'email' = 'admin@cheotnun.com'
    OR auth.jwt() ->> 'email' = 'mauemglobal@gmail.com'
  );

-- Tracking: qualquer um pode inserir e ler
CREATE POLICY "Anyone can insert tracking" ON cheotnun_order_tracking
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read tracking" ON cheotnun_order_tracking
  FOR SELECT USING (true);

-- --------------------------------------------------
-- HABILITAR REALTIME PARA PEDIDOS
-- --------------------------------------------------
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE cheotnun_orders;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE cheotnun_orders;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Ative manualmente: Database > Replication no Supabase Dashboard';
  END;
END;
$$;

-- --------------------------------------------------
-- ÍNDICES ADICIONAIS
-- --------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_cheotnun_orders_created ON cheotnun_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cheotnun_order_tracking_order_status ON cheotnun_order_tracking(order_id, status);

-- =============================================================================
-- STEP 5: SEED DATA (dados iniciais)
-- =============================================================================

-- --------------------------------------------------
-- 5.1 USUÁRIOS
-- --------------------------------------------------
INSERT INTO cheotnun_users (id, email, name) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@cheotnun.com', 'Super Administrador Cheotnun'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'cliente@example.com', 'Jaque Customer')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------
-- 5.2 CATEGORIAS
-- --------------------------------------------------
INSERT INTO cheotnun_categories (id, name, slug, description, image) VALUES
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Cuidado Facial', 'cuidado-facial', 'Produtos de limpeza, tônicos, séruns e hidratantes para o rosto.', 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Cuidado Corporal', 'cuidado-corporal', 'Hidratação e tratamento para todo o corpo.', 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Cuidado Capilar', 'cuidado-capilar', 'Shampoos, condicionadores e máscaras capilares.', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=400'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Maquillaje', 'maquillaje', 'Bases, corretivos, batons e maquiagens premium.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400'),
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Cuidado de Uñas', 'cuidado-de-unas', 'Esmaltes e fortalecedores de unhas.', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400'),
('60eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Protección Solar', 'proteccion-solar', 'Protetores solares faciais e corporais de alta tecnologia.', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------
-- 5.3 MARCAS
-- --------------------------------------------------
INSERT INTO cheotnun_brands (id, name, slug, description, is_featured) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Round Lab', 'round-lab', 'Produtos formulados com água do fundo do mar e ingredientes naturais.', true),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Beauty of Joseon', 'beauty-of-joseon', 'Cosméticos inspirados na medicina tradicional coreana (Hanbang).', true),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'COSRX', 'cosrx', 'Produtos focados em alta performance e ingredientes ativos como Centella e Baba de Caracol.', true),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Anua', 'anua', 'Fórmula limpa e minimalista para acalmar a barreira da pele.', true),
('70eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Skin1004', 'skin1004', 'Produtos baseados em extrato puro de Centella Asiática de Madagascar.', true)
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------
-- 5.4 PRODUTOS
-- --------------------------------------------------
INSERT INTO cheotnun_products (id, sku, name, slug, description, description_en, price, price_promo, weight, volume, stock, hs_code, status, brand_id, category_id, image) VALUES
('11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11', 'RL-DK-1025', '1025 Dokdo Cleanser', '1025-dokdo-cleanser', 'Limpiador facial suave que elimina impurezas y mantiene la hidratación.', 'Gentle facial cleanser that removes impurities and maintains hydration.', 18.00, 16.20, 0.15, '150ml', 120, '3304.99.90', 'active', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400'),
('22ebc999-9c0b-4ef8-bb6d-6bb9bd380a22', 'BJ-GD-0030', 'Glow Deep Serum: Rice + Alpha-Arbutin', 'glow-deep-serum-rice-alpha-arbutin', 'Sérum iluminador diseñado para combatir la pigmentación y unificar el tono.', 'Brightening serum designed to fight pigmentation and unify tone.', 22.90, 19.90, 0.08, '30ml', 85, '3304.99.90', 'active', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400'),
('33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33', 'CX-AM-0100', 'Advanced Snail 96 Mucin Power Essence', 'advanced-snail-96-mucin-power-essence', 'Esencia nutritiva de baba de caracol para reparar la barrera cutánea.', 'Nutritive snail mucin essence to repair the skin barrier.', 19.00, 18.00, 0.18, '100ml', 150, '3304.99.90', 'active', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400'),
('44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44', 'AN-HT-0250', 'Heartleaf 77% Soothing Toner', 'heartleaf-77-soothing-toner', 'Tónico calmante ideal para pieles sensibles y con tendencia al acné.', 'Soothing toner ideal for sensitive and acne-prone skin.', 21.00, 19.50, 0.30, '250ml', 90, '3304.99.90', 'active', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400'),
('55ebc999-9c0b-4ef8-bb6d-6bb9bd380a55', 'SK-MC-0055', 'Madagascar Centella Ampoule', 'madagascar-centella-ampoule', 'Ampolla calmante 100% de Centella Asiática para reparar e hidratar.', 'Soothing 100% Centella Asiatica ampoule to repair and hydrate.', 23.00, 21.00, 0.12, '55ml', 200, '3304.99.90', 'active', '70eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------
-- 5.5 IMAGENS DOS PRODUTOS
-- --------------------------------------------------
INSERT INTO cheotnun_product_images (product_id, url, is_main, sort_order) VALUES
('11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400', true, 0),
('22ebc999-9c0b-4ef8-bb6d-6bb9bd380a22', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400', true, 0),
('33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400', true, 0),
('44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400', true, 0),
('55ebc999-9c0b-4ef8-bb6d-6bb9bd380a55', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400', true, 0)
ON CONFLICT DO NOTHING;

-- --------------------------------------------------
-- 5.6 BLOG POSTS
-- --------------------------------------------------
INSERT INTO cheotnun_blog_posts (id, title, slug, subtitle, content, image, author, seo_title, seo_description, status) VALUES
('a1000000-0000-0000-0000-000000000101', '5 Secretos del Skincare Coreano para una Piel Radiante', '5-secretos-skincare-coreano', 'Descubre los principios fundamentales de la rutina coreana que transformarán tu piel.', '<p>El skincare coreano no es solo una moda, es una filosofía de cuidado. Aquí te revelamos los 5 secretos mejor guardados que toda rutina K-Beauty debe incluir para lograr una piel luminosa y saludable.</p><h3>1. Doble Limpieza</h3><p>El primer paso y el más importante. Consiste en usar primero un limpiador a base de aceite para eliminar maquillaje y protector solar, seguido de un limpiador a base de agua para limpiar profundamente los poros.</p><h3>2. Exfoliación Suave</h3><p>Olvídate de los exfoliantes agresivos. En Corea se prefiere la exfoliación química suave con ingredientes como ácido láctico o PHA que renuevan la piel sin dañarla.</p><h3>3. Esencias y Sérums</h3><p>Las esencias son el corazón de la rutina coreana. Aplicadas después del tónico, preparan la piel para absorber mejor los sérums y tratamientos posteriores.</p><h3>4. Hidratación en Capas</h3><p>La clave está en aplicar múltiples capas ligeras de hidratación en lugar de una sola crema pesada. Esto permite que cada producto penetre mejor.</p><h3>5. Protección Solar Diaria</h3><p>El paso más importante. Un buen protector solar coreano no solo protege, sino que también cuida y nutre la piel mientras la defiende de los rayos UV.</p>', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200', 'Dr. Park', '5 Secretos del Skincare Coreano | K-Beauty Tips', 'Descubre los 5 secretos fundamentales del skincare coreano para transformar tu rutina de belleza.', 'published'),
('a1000000-0000-0000-0000-000000000102', 'Cómo Aplicar el Dokdo Cleanser de Round Lab', 'como-aplicar-dokdo-cleanser-round-lab', 'Guía paso a paso para usar correctamente el limpiador facial más popular de Round Lab.', '<p>El Dokdo Cleanser de Round Lab se ha convertido en un producto imprescindible en muchas rutinas coreanas. Te enseñamos cómo aplicarlo correctamente para obtener los mejores resultados.</p><h3>¿Por qué es tan especial?</h3><p>Formulado con agua del mar profundo de la isla Dokdo, este limpiador elimina impurezas mientras mantiene la hidratación natural de la piel gracias a sus ingredientes minerales.</p><h3>Paso a Paso</h3><p><strong>Paso 1:</strong> Humedece tu rostro con agua tibia para abrir los poros.</p><p><strong>Paso 2:</strong> Aplica una pequeña cantidad de producto en la palma de tu mano.</p><p><strong>Paso 3:</strong> Masajea suavemente en círculos durante 30-60 segundos.</p><p><strong>Paso 4:</strong> Enjuaga con agua tibia y seca suavemente con una toalla limpia.</p><h3>Consejos Extra</h3><p>Utilízalo tanto en tu rutina de mañana como de noche. Por la mañana eliminará el exceso de grasa nocturna, y por la noche retirará las impurezas acumuladas durante el día.</p>', 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1200', 'Kim Min-seo', 'Cómo Aplicar Dokdo Cleanser | Guía Round Lab', 'Aprende a aplicar correctamente el Dokdo Cleanser de Round Lab.', 'published')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------
-- 5.7 SITE CONTENT (home, header, footer)
-- --------------------------------------------------
INSERT INTO cheotnun_site_content (id, page_name, section_key, content) VALUES
('a1000000-0000-0000-0000-000000000001', 'home', 'hero', '{"titleLine1": "Tu belleza.", "titleLine2": "Tu ritual.", "titleLine3": "Tu momento.", "subtitle": "Cosméticos coreanos auténticos seleccionados para cada etapa de tu cuidado facial. Fórmulas botánicas que revelan tu luminosidad natural.", "btnBuyText": "COMPRAR AHORA", "btnBuyLink": "/tienda", "btnRoutineText": "DESCUBRIR RUTINAS", "btnRoutineLink": "/rutinas", "bgImage": "/images/banner.webp"}'::jsonb),
('a1000000-0000-0000-0000-000000000002', 'home', 'highlights', '{"items": [{"icon": "ShieldCheck", "title": "100% ORIGINALES", "text": "Directo desde Corea"}, {"icon": "Truck", "title": "ENVÍOS INTERNACIONALES", "text": "A toda América Latina"}, {"icon": "ShieldAlert", "title": "PASOS SEGUROS", "text": "Protegemos tu compra"}, {"icon": "Heart", "title": "ATENCIÓN PERSONALIZADA", "text": "Estamos para ayudarte"}]}'::jsonb),
('a1000000-0000-0000-0000-000000000003', 'home', 'categories', '{"preTitle": "Colección Curada", "title": "Descubre lo mejor del K-Beauty", "subtitle": "Productos auténticos para realzar tu belleza natural.", "buttonText": "VER TODAS LAS CATEGORÍAS"}'::jsonb),
('a1000000-0000-0000-0000-000000000004', 'home', 'bestSellers', '{"preTitle": "Favoritos de la Comunidad", "title": "Más vendidos", "subtitle": "Los favoritos de nuestra comunidad internacional. Fórmulas probadas que entregan resultados visibles.", "buttonText": "VER TODOS"}'::jsonb),
('a1000000-0000-0000-0000-000000000005', 'home', 'experiencias', '{"preTitle": "Experiencias Cheotnun", "title": "Vive la belleza coreana más allá de los productos", "cards": [{"badge": "CHEOTNUN EXPERIENCE", "badgeColor": "accent", "title": "Prueba, siente y descubre.", "text": "Damos a probar productos exclusivos en experiencias únicas en Corea del Sur.", "buttonText": "SABER MÁS", "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400"}, {"badge": "EN COLABORACIÓN CON MAEUM", "badgeColor": "blue", "title": "Viajes que transforman.", "text": "Viaja a Corea y vive la cultura, la belleza y el bienestar de una forma auténtica.", "buttonText": "EXPLORAR VIAJES", "image": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=400"}, {"badge": "BEAUTY & CULTURA", "badgeColor": "accent", "title": "Más que belleza, una conexión.", "text": "Sumérgete en la cultura coreana y descubre el origen de tu rutina de belleza.", "buttonText": "VER EXPERIENCIAS", "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400"}]}'::jsonb),
('a1000000-0000-0000-0000-000000000006', 'home', 'routines', '{"preTitle": "Tratamientos Específicos", "title": "Rutinas para cada necesidad", "subtitle": "Encuentra la rutina ideal para tu tipo de piel y estilo de vida.", "buttonText": "VER TODAS LAS RUTINAS", "items": [{"name": "Piel Hidratada", "icon": "Droplet"}, {"name": "Piel Iluminada", "icon": "Sparkles"}, {"name": "Piel Sensible", "icon": "Smile"}, {"name": "Anti-acné", "icon": "ShieldCheck"}, {"name": "Anti-edad", "icon": "Hourglass"}, {"name": "Rutina Completa", "icon": "ClipboardList"}], "badges": [{"icon": "ShieldCheck", "title": "Ingredientes seguros"}, {"icon": "Droplet", "title": "Fórmulas efectivas"}, {"icon": "Star", "title": "Resultados reales"}, {"icon": "Compass", "title": "Inspirado en la tradición"}, {"icon": "Smile", "title": "Desarrollado con ciencia"}]}'::jsonb),
('a1000000-0000-0000-0000-000000000007', 'home', 'instagram', '{"title": "Únete a nuestra comunidad", "subtitle": "Tips, rutinas, lanzamientos y mucho más en Instagram.", "buttonText": "SEGUIR EN INSTAGRAM", "buttonLink": "https://instagram.com/cheotnun.kbeauty", "images": ["https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400", "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400", "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=400", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400", "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400"]}'::jsonb),
('a1000000-0000-0000-0000-000000000008', 'home', 'newsletter', '{"preTitle": "CHEOTNUN CLUB", "title": "Sé la primera en descubrir nuevos lanzamientos y ofertas.", "buttonText": "SUSCRIBIRSE", "successMessage": "✓ ¡Te has suscrito con éxito! Bienvenido al Cheotnun Club."}'::jsonb),
('a1000000-0000-0000-0000-000000000009', 'header', 'main', '{"announcementText": "Belleza que nace de la tradición. Cosmética que transforma.", "shippingText": "Envíos para toda América Latina", "attentionText": "Atención", "logoUrl": "/images/cheotnun-logo.webp"}'::jsonb),
('a1000000-0000-0000-0000-000000000010', 'footer', 'main', '{"description": "Importamos los cosméticos coreanos más exclusivos y galardonados a nivel internacional para transformar tu rutina diaria de skincare en un ritual de lujo.", "social": {"instagram": "https://instagram.com/cheotnun.kbeauty", "youtube": "https://youtube.com/cheotnun.kbeauty"}, "columns": [{"title": "Tienda", "links": [{"label": "Todos los productos", "href": "/tienda"}, {"label": "Cuidado Facial", "href": "/tienda?category=cuidado-facial"}, {"label": "Protección Solar", "href": "/tienda?category=proteccion-solar"}, {"label": "Rutinas Recomendadas", "href": "/rutinas"}, {"label": "Blog", "href": "/blog"}]}, {"title": "Ayuda & Políticas", "links": [{"label": "Envíos y Entregas", "href": "/ayuda/envios"}, {"label": "Cambios y Devoluciones", "href": "/ayuda/devoluciones"}, {"label": "Política de Privacidad", "href": "/politica-de-privacidad"}, {"label": "Términos y Condiciones", "href": "/terminos"}]}, {"title": "Atención al Cliente", "links": [{"label": "WhatsApp: +34 600 111 222", "href": "https://wa.me/34600111222", "icon": "MessageCircle"}, {"label": "hola@cheotnun.com", "href": "mailto:hola@cheotnun.com", "icon": "Mail"}, {"label": "Calle Gran Vía 12, Madrid, España", "href": "#", "icon": "MapPin"}]}]}'::jsonb)
ON CONFLICT (page_name, section_key) DO NOTHING;

-- --------------------------------------------------
-- 5.8 CMS BLOCKS
-- --------------------------------------------------
INSERT INTO cheotnun_cms_blocks (id, page_name, section_id, block_type, content, sort_order, active) VALUES
('block-hero', 'home', 'hero', 'hero', '{"title": "Tu belleza. Tu ritual. Tu momento.", "subtitle": "Cosméticos coreanos auténticos para cada etapa de tu cuidado.", "btnBuyText": "COMPRAR AHORA", "btnBuyLink": "/tienda", "btnRoutineText": "DESCUBRIR RUTINAS", "btnRoutineLink": "/rutinas", "bgImage": "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1920"}'::jsonb, 0, true),
('block-features', 'home', 'features', 'features', '{"items": [{"icon": "ShieldCheck", "title": "100% ORIGINALES", "text": "Directo desde Corea"}, {"icon": "Truck", "title": "ENVÍOS INTERNACIONALES", "text": "A toda América Latina"}, {"icon": "ShieldAlert", "title": "PAGOS SEGUROS", "text": "Protegemos tu compra"}, {"icon": "Heart", "title": "ATENCIÓN PREMIUM", "text": "Estamos para ayudarte"}]}'::jsonb, 1, true)
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------
-- 5.9 ROUTINES
-- --------------------------------------------------
INSERT INTO cheotnun_routines (id, title, slug, description, skin_type, steps, video_url, status) VALUES
('a1000000-0000-0000-0000-000000000201', 'Rutina Hidratante y Calmante', 'rutina-hidratante-calmante', 'Rutina de día recomendada para pieles secas y sensibles.', 'Piel Sensible',
'[{"step": 1, "action": "Limpieza", "product_id": "11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11", "instruction": "Limpiar suavemente el rostro con agua tibia."}, {"step": 2, "action": "Tonificación", "product_id": "44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44", "instruction": "Aplicar a golpecitos con las manos."}, {"step": 3, "action": "Ampolla", "product_id": "55ebc999-9c0b-4ef8-bb6d-6bb9bd380a55", "instruction": "Aplicar una pipeta completa y esparcir."}, {"step": 4, "action": "Hidratación y Reparación", "product_id": "33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33", "instruction": "Masajear para sellar la hidratación."}]'::jsonb,
'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'active')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------
-- 5.10 SYSTEM SETTINGS
-- --------------------------------------------------
INSERT INTO cheotnun_system_settings (key, value) VALUES
('visual_theme', '{"colors": {"primary": "#08152F", "secondary": "#091731", "accent": "#C9C9C9", "accentHover": "#C9C9C9", "text": "#F3F4F6", "background": "#08152F", "card": "rgba(15, 23, 42, 0.65)"}, "typography": {"titleFont": "Cormorant Garamond", "bodyFont": "Inter", "baseSize": "16px"}, "logo_url": "/images/cheotnun-logo.webp", "favicon_url": "/favicon.ico"}'::jsonb),
('company_details', '{"name": "Cheotnun K-Beauty S.L.", "phone": "+34 912 345 678", "whatsapp": "+34600000000", "email": "hola@cheotnun.com", "address": "Calle Gran Vía 12, Madrid, España", "social": {"instagram": "https://instagram.com/cheotnun.kbeauty", "youtube": "https://youtube.com/cheotnun.kbeauty"}}'::jsonb),
('seo', '{"titleSuffix": "| Cheotnun K-Beauty", "metaDescription": "Cosméticos coreanos auténticos para cada etapa de tu cuidado facial. Envíos internacionales.", "googleAnalyticsId": ""}'::jsonb),
('smtp', '{"server": "smtp.mailgun.org", "email": "no-reply@cheotnun.com", "user": "no-reply@cheotnun.com"}'::jsonb),
('payments', '{"stripePublicKey": "pk_live_51M3c..."}'::jsonb),
('shipping_zones', '[{"country": "Brasil", "methods": [{"name": "K-Packet", "days": "15-25", "price": 15.00}, {"name": "EMS", "days": "7-10", "price": 35.00}]}, {"country": "México", "methods": [{"name": "K-Packet", "days": "15-20", "price": 15.00}]}, {"country": "Chile", "methods": [{"name": "K-Packet", "days": "12-20", "price": 18.00}]}, {"country": "Colombia", "methods": [{"name": "K-Packet", "days": "15-25", "price": 18.00}]}, {"country": "Argentina", "methods": [{"name": "K-Packet", "days": "20-30", "price": 20.00}]}, {"country": "España", "methods": [{"name": "Correos", "days": "5-10", "price": 10.00}]}]'::jsonb),
('invoice_templates', '{"es": {"title": "FACTURA COMERCIAL", "seller": "Vendedor", "buyer": "Comprador", "description": "Descripción", "quantity": "Cantidad", "unitPrice": "Precio Unitario", "total": "Total", "shipping": "Envío", "subtotal": "Subtotal", "grandTotal": "Gran Total"}, "en": {"title": "COMMERCIAL INVOICE", "seller": "Seller", "buyer": "Buyer", "description": "Description", "quantity": "Quantity", "unitPrice": "Unit Price", "total": "Total", "shipping": "Shipping", "subtotal": "Subtotal", "grandTotal": "Grand Total"}}'::jsonb),
('live_chat', '{"whatsappNumber": "+34600000000", "telegramToken": "", "telegramChatId": "", "autoReplyEnabled": true, "autoReplyMessage": "¡Hola! Gracias por contactarnos. Te responderemos a la brevedad."}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- --------------------------------------------------
-- 5.11 CUPONS
-- --------------------------------------------------
INSERT INTO cheotnun_coupons (code, discount, type, status) VALUES
('CUPOM10', 10.00, 'fixed', 'active'),
('KBEAUTY5', 5.00, 'fixed', 'active')
ON CONFLICT (code) DO NOTHING;

-- --------------------------------------------------
-- 5.12 PEDIDOS DE EXEMPLO
-- --------------------------------------------------
INSERT INTO cheotnun_orders (id, customer_id, status, subtotal, shipping_amount, discount_amount, total_amount, gateway, carrier, tracking_code, items, shipping_address, billing_address, commercial_invoice_url, created_at) VALUES
('ord-001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'aguardando_confirmacao', 36.00, 15.00, 0, 51.00, 'stripe', NULL, NULL, '[{"product_id": "11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11", "name": "1025 Dokdo Cleanser", "quantity": 2, "price": 18.00}]'::jsonb, '{"first_name": "Jaque", "last_name": "Customer", "street": "Gran Via", "number": "123", "city": "Madrid", "state": "Madrid", "country": "España", "postal_code": "28013"}', '{"first_name": "Jaque", "last_name": "Customer", "street": "Gran Via", "number": "123", "city": "Madrid", "state": "Madrid", "country": "España"}', '/invoices/cheotnun-inv-ord-001.pdf', NOW() - INTERVAL '0 days'),
('ord-002', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'preparando_envio', 22.90, 15.00, 0, 37.90, 'stripe', 'DHL', 'LX123456789KR', '[{"product_id": "22ebc999-9c0b-4ef8-bb6d-6bb9bd380a22", "name": "Glow Deep Serum", "quantity": 1, "price": 22.90}]'::jsonb, '{"first_name": "Jaque", "last_name": "Customer", "street": "Gran Via", "number": "123", "city": "Madrid", "state": "Madrid", "country": "España"}', '{"first_name": "Jaque", "last_name": "Customer", "street": "Gran Via", "number": "123", "city": "Madrid", "state": "Madrid", "country": "España"}', '/invoices/cheotnun-inv-ord-002.pdf', NOW() - INTERVAL '1 day'),
('ord-003', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'enviado', 19.00, 15.00, 0, 34.00, 'paypal', 'FedEx', 'FX987654321KR', '[{"product_id": "33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33", "name": "Advanced Snail 96 Mucin Power Essence", "quantity": 1, "price": 19.00}]'::jsonb, '{"first_name": "Jaque", "last_name": "Customer", "street": "Gran Via", "number": "123", "city": "Madrid", "state": "Madrid", "country": "España"}', '{"first_name": "Jaque", "last_name": "Customer", "street": "Gran Via", "number": "123", "city": "Madrid", "state": "Madrid", "country": "España"}', '/invoices/cheotnun-inv-ord-003.pdf', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------
-- 5.13 PLANOS DE ASSINATURA
-- --------------------------------------------------
INSERT INTO cheotnun_subscription_plans (id, name, price, description, features) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'Box Standard', 19.90, 'Box mensual de productos coreanos esenciales.', '{"Box mensual de productos", "Beneficios exclusivos"}'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Box Premium', 29.90, 'Box mensual de productos coreanos premium + regalos adicionales.', '{"Box mensual premium", "Beneficios exclusivos", "Descuentos especiales"}'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'Box Deluxe', 39.90, 'Box de lujo con lanzamientos y experiencias exclusivas.', '{"Box mensual de lujo", "Beneficios exclusivos", "Descuentos especiales", "Acceso anticipado", "Regalos exclusivos"}')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------
-- 5.14 ASSINATURA DE EXEMPLO
-- --------------------------------------------------
INSERT INTO cheotnun_subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------
-- 5.15 PAGAMENTO DE ASSINATURA DE EXEMPLO
-- --------------------------------------------------
INSERT INTO cheotnun_subscription_payments (subscription_id, amount, status) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 29.90, 'paid')
ON CONFLICT DO NOTHING;
