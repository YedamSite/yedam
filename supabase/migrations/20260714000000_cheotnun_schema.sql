-- Cheotnun K-Beauty Schema for Supabase
-- Creates all tables matching the app's cheotnun_ naming convention

-- Categories
CREATE TABLE IF NOT EXISTS cheotnun_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    translations JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brands
CREATE TABLE IF NOT EXISTS cheotnun_brands (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    translations JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS cheotnun_products (
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

-- Blog Posts
CREATE TABLE IF NOT EXISTS cheotnun_blog_posts (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    subtitle TEXT,
    content TEXT,
    image TEXT,
    author TEXT DEFAULT 'Cheotnun Editor',
    seo_title TEXT,
    seo_description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
    translations JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Content (header, footer, home sections)
CREATE TABLE IF NOT EXISTS cheotnun_site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_name VARCHAR(100) NOT NULL,
    section_key VARCHAR(255) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    translations JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_name, section_key)
);

-- CMS Blocks (for reusable content blocks)
CREATE TABLE IF NOT EXISTS cheotnun_cms_blocks (
    id UUID PRIMARY KEY,
    page_name VARCHAR(100) NOT NULL,
    section_id VARCHAR(100) NOT NULL,
    block_type VARCHAR(100) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    translations JSONB DEFAULT '{}'::jsonb,
    sort_order INT NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

-- Routines
CREATE TABLE IF NOT EXISTS cheotnun_routines (
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

-- System Settings (key-value store)
CREATE TABLE IF NOT EXISTS cheotnun_system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL
);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS cheotnun_newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (profile data linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS cheotnun_users (
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

-- Orders
CREATE TABLE IF NOT EXISTS cheotnun_orders (
    id UUID PRIMARY KEY,
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
    commercial_invoice_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE cheotnun_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_cms_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheotnun_orders ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can read published content)
CREATE POLICY "Public read categories" ON cheotnun_categories FOR SELECT USING (true);
CREATE POLICY "Public read brands" ON cheotnun_brands FOR SELECT USING (true);
CREATE POLICY "Public read products" ON cheotnun_products FOR SELECT USING (true);
CREATE POLICY "Public read site content" ON cheotnun_site_content FOR SELECT USING (true);
CREATE POLICY "Public read cms blocks" ON cheotnun_cms_blocks FOR SELECT USING (true);
CREATE POLICY "Public read routines" ON cheotnun_routines FOR SELECT USING (true);
CREATE POLICY "Public read system settings" ON cheotnun_system_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can subscribe" ON cheotnun_newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Public read published blog posts only
CREATE POLICY "Read published posts" ON cheotnun_blog_posts FOR SELECT USING (status = 'published');

-- Users can read own data
CREATE POLICY "Users read own" ON cheotnun_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own" ON cheotnun_users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own" ON cheotnun_users FOR UPDATE USING (auth.uid() = id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cheotnun_products_slug ON cheotnun_products(slug);
CREATE INDEX IF NOT EXISTS idx_cheotnun_products_category ON cheotnun_products(category_id);
CREATE INDEX IF NOT EXISTS idx_cheotnun_products_brand ON cheotnun_products(brand_id);
CREATE INDEX IF NOT EXISTS idx_cheotnun_blog_posts_slug ON cheotnun_blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_cheotnun_blog_posts_status ON cheotnun_blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_cheotnun_orders_customer ON cheotnun_orders(customer_id);

-- Seed data matching the existing DEFAULT_STATE in db.ts
INSERT INTO cheotnun_categories (id, name, slug, description, image) VALUES
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Cuidado Facial', 'cuidado-facial', 'Produtos de limpeza, tônicos, séruns e hidratantes para o rosto.', 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Cuidado Corporal', 'cuidado-corporal', 'Hidratação e tratamento para todo o corpo.', 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Cuidado Capilar', 'cuidado-capilar', 'Shampoos, condicionadores e máscaras capilares.', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=400'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Maquillaje', 'maquillaje', 'Bases, corretivos, batons e maquiagens premium.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400'),
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Cuidado de Uñas', 'cuidado-de-unas', 'Esmaltes e fortalecedores de unhas.', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400'),
('60eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Protección Solar', 'proteccion-solar', 'Protetores solares faciais e corporais de alta tecnologia.', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cheotnun_brands (id, name, slug, description, is_featured) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Round Lab', 'round-lab', 'Produtos formulados com água do fundo do mar e ingredientes naturais.', true),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Beauty of Joseon', 'beauty-of-joseon', 'Cosméticos inspirados na medicina tradicional coreana (Hanbang).', true),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'COSRX', 'cosrx', 'Produtos focados em alta performance e ingredientes ativos como Centella e Baba de Caracol.', true),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Anua', 'anua', 'Fórmula limpa e minimalista para acalmar a barreira da pele.', true),
('70eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Skin1004', 'skin1004', 'Produtos baseados em extrato puro de Centella Asiática de Madagascar.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO cheotnun_products (id, sku, name, slug, description, description_en, price, price_promo, weight, volume, stock, hs_code, status, brand_id, category_id, image) VALUES
('11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11', 'RL-DK-1025', '1025 Dokdo Cleanser', '1025-dokdo-cleanser', 'Limpiador facial suave que elimina impurezas y mantiene la hidratación.', 'Gentle facial cleanser that removes impurities and maintains hydration.', 18.00, 16.20, 0.15, '150ml', 120, '3304.99.90', 'active', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400'),
('22ebc999-9c0b-4ef8-bb6d-6bb9bd380a22', 'BJ-GD-0030', 'Glow Deep Serum: Rice + Alpha-Arbutin', 'glow-deep-serum-rice-alpha-arbutin', 'Sérum iluminador diseñado para combatir la pigmentación y unificar el tono.', 'Brightening serum designed to fight pigmentation and unify tone.', 22.90, 19.90, 0.08, '30ml', 85, '3304.99.90', 'active', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400'),
('33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33', 'CX-AM-0100', 'Advanced Snail 96 Mucin Power Essence', 'advanced-snail-96-mucin-power-essence', 'Esencia nutritiva de baba de caracol para reparar la barrera cutánea.', 'Nutritive snail mucin essence to repair the skin barrier.', 19.00, 18.00, 0.18, '100ml', 150, '3304.99.90', 'active', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400'),
('44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44', 'AN-HT-0250', 'Heartleaf 77% Soothing Toner', 'heartleaf-77-soothing-toner', 'Tónico calmante ideal para pieles sensibles y con tendencia al acné.', 'Soothing toner ideal for sensitive and acne-prone skin.', 21.00, 19.50, 0.30, '250ml', 90, '3304.99.90', 'active', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400'),
('55ebc999-9c0b-4ef8-bb6d-6bb9bd380a55', 'SK-MC-0055', 'Madagascar Centella Ampoule', 'madagascar-centella-ampoule', 'Ampolla calmante 100% de Centella Asiática para reparar e hidratar.', 'Soothing 100% Centella Asiatica ampoule to repair and hydrate.', 23.00, 21.00, 0.12, '55ml', 200, '3304.99.90', 'active', '70eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cheotnun_blog_posts (id, title, slug, subtitle, content, image, author, seo_title, seo_description, status) VALUES
('1', '5 Secretos del Skincare Coreano para una Piel Radiante', '5-secretos-skincare-coreano', 'Descubre los principios fundamentales de la rutina coreana que transformarán tu piel.', '<p>El skincare coreano no es solo una moda, es una filosofía de cuidado. Aquí te revelamos los 5 secretos mejor guardados que toda rutina K-Beauty debe incluir para lograr una piel luminosa y saludable.</p><h3>1. Doble Limpieza</h3><p>El primer paso y el más importante. Consiste en usar primero un limpiador a base de aceite para eliminar maquillaje y protector solar, seguido de un limpiador a base de agua para limpiar profundamente los poros.</p><h3>2. Exfoliación Suave</h3><p>Olvídate de los exfoliantes agresivos. En Corea se prefiere la exfoliación química suave con ingredientes como ácido láctico o PHA que renuevan la piel sin dañarla.</p><h3>3. Esencias y Sérums</h3><p>Las esencias son el corazón de la rutina coreana. Aplicadas después del tónico, preparan la piel para absorber mejor los sérums y tratamientos posteriores.</p><h3>4. Hidratación en Capas</h3><p>La clave está en aplicar múltiples capas ligeras de hidratación en lugar de una sola crema pesada. Esto permite que cada producto penetre mejor.</p><h3>5. Protección Solar Diaria</h3><p>El paso más importante. Un buen protector solar coreano no solo protege, sino que también cuida y nutre la piel mientras la defiende de los rayos UV.</p>', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200', 'Dr. Park', '5 Secretos del Skincare Coreano | K-Beauty Tips', 'Descubre los 5 secretos fundamentales del skincare coreano para transformar tu rutina de belleza.', 'published'),
('2', 'Cómo Aplicar el Dokdo Cleanser de Round Lab', 'como-aplicar-dokdo-cleanser-round-lab', 'Guía paso a paso para usar correctamente el limpiador facial más popular de Round Lab.', '<p>El Dokdo Cleanser de Round Lab se ha convertido en un producto imprescindible en muchas rutinas coreanas.</p>', 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1200', 'Kim Min-seo', 'Cómo Aplicar Dokdo Cleanser | Guía Round Lab', 'Aprende a aplicar correctamente el Dokdo Cleanser de Round Lab.', 'published')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cheotnun_site_content (id, page_name, section_key, content) VALUES
('a1000000-0000-0000-0000-000000000001', 'home', 'hero', '{"titleLine1": "Tu belleza.", "titleLine2": "Tu ritual.", "titleLine3": "Tu momento.", "subtitle": "Cosméticos coreanos auténticos seleccionados para cada etapa de tu cuidado facial.", "btnBuyText": "COMPRAR AHORA", "btnBuyLink": "/tienda", "btnRoutineText": "DESCUBRIR RUTINAS", "btnRoutineLink": "/rutinas", "bgImage": "/images/banner.webp"}'::jsonb),
('a1000000-0000-0000-0000-000000000002', 'home', 'highlights', '{"items": [{"icon": "ShieldCheck", "title": "100% ORIGINALES", "text": "Directo desde Corea"}, {"icon": "Truck", "title": "ENVÍOS INTERNACIONALES", "text": "A toda América Latina"}, {"icon": "ShieldAlert", "title": "PASOS SEGUROS", "text": "Protegemos tu compra"}, {"icon": "Heart", "title": "ATENCIÓN PERSONALIZADA", "text": "Estamos para ayudarte"}]}'::jsonb),
('a1000000-0000-0000-0000-000000000003', 'home', 'categories', '{"preTitle": "Colección Curada", "title": "Descubre lo mejor del K-Beauty", "subtitle": "Productos auténticos para realzar tu belleza natural.", "buttonText": "VER TODAS LAS CATEGORÍAS"}'::jsonb),
('a1000000-0000-0000-0000-000000000004', 'home', 'bestSellers', '{"preTitle": "Favoritos de la Comunidad", "title": "Más vendidos", "subtitle": "Los favoritos de nuestra comunidad internacional.", "buttonText": "VER TODOS"}'::jsonb),
('a1000000-0000-0000-0000-000000000009', 'header', 'main', '{"announcementText": "Belleza que nace de la tradición. Cosmética que transforma.", "shippingText": "Envíos para toda América Latina", "attentionText": "Atención", "logoUrl": "/images/logo.webp"}'::jsonb),
('a1000000-0000-0000-0000-000000000010', 'footer', 'main', '{"description": "Importamos los cosméticos coreanos más exclusivos.", "social": {"instagram": "https://instagram.com/cheotnun.kbeauty", "youtube": "https://youtube.com/cheotnun.kbeauty"}}'::jsonb)
ON CONFLICT (page_name, section_key) DO NOTHING;

INSERT INTO cheotnun_system_settings (key, value) VALUES
('visual_theme', '{"colors": {"primary": "#08152F", "secondary": "#091731", "accent": "#C9C9C9", "accentHover": "#C9C9C9", "text": "#F3F4F6", "background": "#08152F", "card": "rgba(15, 23, 42, 0.65)"}, "typography": {"titleFont": "Cormorant Garamond", "bodyFont": "Inter", "baseSize": "16px"}, "logo_url": "/images/logo.webp", "favicon_url": "/favicon.ico"}'::jsonb),
('company_details', '{"name": "Cheotnun K-Beauty S.L.", "phone": "+34 912 345 678", "whatsapp": "+34600000000", "email": "hola@cheotnun.com", "address": "Calle Gran Vía 12, Madrid, España", "social": {"instagram": "https://instagram.com/cheotnun.kbeauty", "youtube": "https://youtube.com/cheotnun.kbeauty"}}'::jsonb),
('seo', '{"titleSuffix": "| Cheotnun K-Beauty", "metaDescription": "Cosméticos coreanos de alta performance seleccionados para tu rutina.", "googleAnalyticsId": ""}'::jsonb),
('invoice_templates', '{"es": {"title": "FACTURA COMERCIAL", "seller": "Vendedor", "buyer": "Comprador", "description": "Descripción", "quantity": "Cantidad", "unitPrice": "Precio Unitario", "total": "Total", "shipping": "Envío", "subtotal": "Subtotal", "grandTotal": "Gran Total"}, "en": {"title": "COMMERCIAL INVOICE", "seller": "Seller", "buyer": "Buyer", "description": "Description", "quantity": "Quantity", "unitPrice": "Unit Price", "total": "Total", "shipping": "Shipping", "subtotal": "Subtotal", "grandTotal": "Grand Total"}}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO cheotnun_routines (id, title, slug, description, skin_type, steps, video_url, status) VALUES
('routine-1', 'Rutina Hidratante y Calmante', 'rutina-hidratante-calmante', 'Rutina de día recomendada para pieles secas y sensibles.', 'Piel Sensible',
'[{"step": 1, "action": "Limpieza", "product_id": "11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11", "instruction": "Limpiar suavemente el rostro con agua tibia."}, {"step": 2, "action": "Tonificación", "product_id": "44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44", "instruction": "Aplicar a golpecitos con las manos."}, {"step": 3, "action": "Ampolla", "product_id": "55ebc999-9c0b-4ef8-bb6d-6bb9bd380a55", "instruction": "Aplicar una pipeta completa y esparcir."}, {"step": 4, "action": "Hidratación y Reparación", "product_id": "33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33", "instruction": "Masajear para sellar la hidratación."}]'::jsonb,
'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cheotnun_users (id, email, name) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@cheotnun.com', 'Super Administrador Cheotnun'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'cliente@example.com', 'Jaque Customer')
ON CONFLICT (id) DO NOTHING;
