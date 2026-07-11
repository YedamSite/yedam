-- Setup initial database schema for Yedam K-Beauty
CREATE TYPE user_role_yedam AS ENUM ('super_admin', 'admin', 'manager', 'editor', 'operator', 'customer');
CREATE TYPE order_status AS ENUM ('pending', 'payment_approved', 'preparing', 'shipped', 'delivered', 'cancelled');

CREATE TABLE yedam_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role_yedam NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE yedam_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES yedam_categories(id) ON DELETE SET NULL
);

CREATE TABLE yedam_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    is_featured BOOLEAN DEFAULT FALSE
);

CREATE TABLE yedam_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    brand_id UUID REFERENCES yedam_brands(id) ON DELETE SET NULL,
    category_id UUID REFERENCES yedam_categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES yedam_categories(id) ON DELETE SET NULL,
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE yedam_product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES yedam_products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0
);

CREATE TABLE yedam_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES yedam_users(id) ON DELETE CASCADE,
    address_type VARCHAR(50) NOT NULL, -- 'shipping' or 'billing'
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
    document_type VARCHAR(20), -- 'nif', 'nie', 'rut', 'ci'
    document_number VARCHAR(100)
);

CREATE TABLE yedam_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES yedam_users(id) ON DELETE SET NULL,
    status order_status NOT NULL DEFAULT 'pending',
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    gateway VARCHAR(100) NOT NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    document_type VARCHAR(20),
    document_number VARCHAR(100),
    commercial_invoice_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE yedam_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES yedam_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES yedam_products(id) ON DELETE SET NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE yedam_order_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES yedam_orders(id) ON DELETE CASCADE,
    status order_status NOT NULL,
    tracking_code VARCHAR(100),
    carrier VARCHAR(100),
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE yedam_communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES yedam_orders(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'email', 'push'
    status VARCHAR(50) NOT NULL, -- 'sent', 'failed'
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE yedam_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES yedam_users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES yedam_products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE TABLE yedam_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    skin_type VARCHAR(100) NOT NULL,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb, -- Detalhes das etapas
    video_url TEXT,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE yedam_cms_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_name VARCHAR(100) NOT NULL,
    section_id VARCHAR(100) NOT NULL,
    block_type VARCHAR(100) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    sort_order INT NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE yedam_system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_by UUID REFERENCES yedam_users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Data
INSERT INTO yedam_users (id, email, name, role) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@yedam.com', 'Super Administrador Yedam', 'super_admin'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'cliente@example.com', 'Jaque Customer', 'customer');

INSERT INTO yedam_brands (id, name, slug, description, is_featured) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Round Lab', 'round-lab', 'Produtos formulados com água do fundo do mar e ingredientes naturais.', true),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Beauty of Joseon', 'beauty-of-joseon', 'Cosméticos inspirados na medicina tradicional coreana (Hanbang).', true),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'COSRX', 'cosrx', 'Produtos focados em alta performance e ingredientes ativos como Centella e Baba de Caracol.', true),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Anua', 'anua', 'Fórmula limpa e minimalista para acalmar a barreira da pele.', true),
('70eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Skin1004', 'skin1004', 'Produtos baseados em extrato puro de Centella Asiática de Madagascar.', true);

INSERT INTO yedam_categories (id, name, slug, description) VALUES
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Cuidado Facial', 'cuidado-facial', 'Produtos de limpeza, tônicos, séruns e hidratantes para o rosto.'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Cuidado Corporal', 'cuidado-corporal', 'Hidratação e tratamento para todo o corpo.'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Cuidado Capilar', 'cuidado-capilar', 'Shampoos, condicionadores e máscaras capilares.'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Maquillaje', 'maquillaje', 'Bases, corretivos, batons e maquiagens premium.'),
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Cuidado de Uñas', 'cuidado-de-unas', 'Esmaltes e fortalecedores de unhas.'),
('60eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Protección Solar', 'proteccion-solar', 'Protetores solares faciais e corporais de alta tecnologia.');

INSERT INTO yedam_products (id, sku, name, slug, description, description_en, price, price_promo, weight, volume, stock, hs_code, status, brand_id, category_id) VALUES
('11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11', 'RL-DK-1025', '1025 Dokdo Cleanser', '1025-dokdo-cleanser', 'Limpiador facial suave que elimina impurezas y mantiene la hidratación.', 'Gentle facial cleanser that removes impurities and maintains hydration.', 18.00, 16.20, 0.15, '150ml', 120, '3304.99.90', 'active', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('22ebc999-9c0b-4ef8-bb6d-6bb9bd380a22', 'BJ-GD-0030', 'Glow Deep Serum: Rice + Alpha-Arbutin', 'glow-deep-serum-rice-alpha-arbutin', 'Sérum iluminador diseñado para combatir la pigmentación y unificar el tono.', 'Brightening serum designed to fight pigmentation and unify tone.', 22.90, 19.90, 0.08, '30ml', 85, '3304.99.90', 'active', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33', 'CX-AM-0100', 'Advanced Snail 96 Mucin Power Essence', 'advanced-snail-96-mucin-power-essence', 'Esencia nutritiva de baba de caracol para reparar la barrera cutánea.', 'Nutritive snail mucin essence to repair the skin barrier.', 19.00, 18.00, 0.18, '100ml', 150, '3304.99.90', 'active', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44', 'AN-HT-0250', 'Heartleaf 77% Soothing Toner', 'heartleaf-77-soothing-toner', 'Tónico calmante ideal para pieles sensibles y con tendencia al acné.', 'Soothing toner ideal for sensitive and acne-prone skin.', 21.00, 19.50, 0.30, '250ml', 90, '3304.99.90', 'active', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('55ebc999-9c0b-4ef8-bb6d-6bb9bd380a55', 'SK-MC-0055', 'Madagascar Centella Ampoule', 'madagascar-centella-ampoule', 'Ampolla calmante 100% de Centella Asiática para reparar e hidratar.', 'Soothing 100% Centella Asiatica ampoule to repair and hydrate.', 23.00, 21.00, 0.12, '55ml', 200, '3304.99.90', 'active', '70eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

INSERT INTO yedam_product_images (product_id, url, is_main, sort_order) VALUES
('11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11', '/products/dokdo-cleanser.jpg', true, 0),
('22ebc999-9c0b-4ef8-bb6d-6bb9bd380a22', '/products/glow-deep-serum.jpg', true, 0),
('33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33', '/products/snail-essence.jpg', true, 0),
('44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44', '/products/heartleaf-toner.jpg', true, 0),
('55ebc999-9c0b-4ef8-bb6d-6bb9bd380a55', '/products/centella-ampoule.jpg', true, 0);

INSERT INTO yedam_routines (title, slug, description, skin_type, steps) VALUES
('Rutina Hidratante y Calmante', 'rutina-hidratante-calmante', 'Rutina de día recomendada para pieles secas y sensibles.', 'Piel Sensible', 
'[
  {"step": 1, "action": "Limpieza", "product_id": "11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11", "instruction": "Limpiar suavemente el rostro con agua tibia."},
  {"step": 2, "action": "Tonificación", "product_id": "44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44", "instruction": "Aplicar a golpecitos con las manos."},
  {"step": 3, "action": "Ampolla", "product_id": "55ebc999-9c0b-4ef8-bb6d-6bb9bd380a55", "instruction": "Aplicar una pipeta completa y esparcir."},
  {"step": 4, "action": "Hidratación y Reparación", "product_id": "33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33", "instruction": "Masajear para sellar la hidratación."}
]'::jsonb);

INSERT INTO yedam_system_settings (key, value) VALUES
('visual_theme', '{
    "colors": {
        "primary": "#030712",
        "secondary": "#0f172a",
        "accent": "#d4af37",
        "accentHover": "#e2c974",
        "text": "#f3f4f6",
        "background": "#020617",
        "card": "rgba(15, 23, 42, 0.6)"
    },
    "typography": {
        "titleFont": "Playfair Display",
        "bodyFont": "Inter",
        "baseSize": "16px"
    },
    "logo_url": "/logo-yedam.png",
    "favicon_url": "/favicon.ico"
}'::jsonb),
('company_details', '{
    "name": "Yedam K-Beauty S.L.",
    "phone": "+34 912 345 678",
    "whatsapp": "+3 Spanish Number",
    "email": "hola@yedambeauty.com",
    "address": "Calle Gran Vía 12, Madrid, España",
    "social": {
        "instagram": "https://instagram.com/yedam.kbeauty",
        "youtube": "https://youtube.com/yedam.kbeauty"
    }
}'::jsonb),
('invoice_templates', '{
    "es": {
        "title": "FACTURA COMERCIAL",
        "seller": "Vendedor",
        "buyer": "Comprador",
        "description": "Descripción",
        "quantity": "Cantidad",
        "unitPrice": "Precio Unitario",
        "total": "Total",
        "shipping": "Envío",
        "subtotal": "Subtotal",
        "grandTotal": "Gran Total"
    },
    "en": {
        "title": "COMMERCIAL INVOICE",
        "seller": "Seller",
        "buyer": "Buyer",
        "description": "Description",
        "quantity": "Quantity",
        "unitPrice": "Unit Price",
        "total": "Total",
        "shipping": "Shipping",
        "subtotal": "Subtotal",
        "grandTotal": "Grand Total"
    }
}'::jsonb);

-- =========================================================================
-- CLUBE YEDAM MEMBERSHIPS & SUBSCRIPTIONS TABLES (NEW)
-- =========================================================================

-- Skincare Club Subscription Plans
CREATE TABLE yedam_subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    interval VARCHAR(50) DEFAULT 'monthly', -- 'monthly', 'quarterly', 'yearly'
    description TEXT,
    features TEXT[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active User Subscriptions
CREATE TABLE yedam_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES yedam_users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES yedam_subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'suspended', 'past_due'
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription Payments History
CREATE TABLE yedam_subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES yedam_subscriptions(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'paid', 'failed', 'refunded'
    invoice_url TEXT,
    payment_date TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- YEDAM INDEXES FOR QUERY OPTIMIZATION (NEW)
-- =========================================================================
CREATE INDEX idx_yedam_products_slug ON yedam_products(slug);
CREATE INDEX idx_yedam_products_category ON yedam_products(category_id);
CREATE INDEX idx_yedam_products_brand ON yedam_products(brand_id);
CREATE INDEX idx_yedam_orders_customer ON yedam_orders(customer_id);
CREATE INDEX idx_yedam_order_items_order ON yedam_order_items(order_id);
CREATE INDEX idx_yedam_favorites_user ON yedam_favorites(user_id);
CREATE INDEX idx_yedam_subscriptions_user ON yedam_subscriptions(user_id);
CREATE INDEX idx_yedam_addresses_user ON yedam_addresses(user_id);

-- =========================================================================
-- SEEDS FOR SUBSCRIPTIONS (NEW)
-- =========================================================================

-- Yedam Subscription Plans Seeds
INSERT INTO yedam_subscription_plans (id, name, price, description, features) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'Box Standard', 19.90, 'Box mensual de productos coreanos esenciales.', '{"Box mensual de produtos", "Beneficios exclusivos"}'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Box Premium', 29.90, 'Box mensual de productos coreanos premium + regalos adicionales.', '{"Box mensual premium", "Beneficios exclusivos", "Descuentos especiales"}'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'Box Deluxe', 39.90, 'Box de lujo con lanzamientos y experiencias exclusivas.', '{"Box mensual de lujo", "Beneficios exclusivos", "Descuentos especiais", "Acceso antecipado", "Regalos exclusivos"}');

-- Active User Subscription Seeds
INSERT INTO yedam_subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'active', '2026-07-11', '2026-08-11');

-- Active User Subscription Payments Seeds
INSERT INTO yedam_subscription_payments (subscription_id, amount, status) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 29.90, 'paid');


