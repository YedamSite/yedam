-- =========================================================================
-- CMS Improvements for Yedam K-Beauty
-- Adds image column to products and creates site_content for full CMS control
-- Does NOT remove any existing tables or data
-- =========================================================================

-- Add image column to products (for main product image directly on product record)
ALTER TABLE yedam_products ADD COLUMN IF NOT EXISTS image TEXT;

-- Add image column to categories for category thumbnail
ALTER TABLE yedam_categories ADD COLUMN IF NOT EXISTS image TEXT;
UPDATE yedam_categories SET image = 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400' WHERE slug = 'cuidado-facial' AND image IS NULL;
UPDATE yedam_categories SET image = 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400' WHERE slug = 'cuidado-corporal' AND image IS NULL;
UPDATE yedam_categories SET image = 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=400' WHERE slug = 'cuidado-capilar' AND image IS NULL;
UPDATE yedam_categories SET image = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400' WHERE slug = 'maquillaje' AND image IS NULL;
UPDATE yedam_categories SET image = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400' WHERE slug = 'cuidado-de-unas' AND image IS NULL;
UPDATE yedam_categories SET image = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400' WHERE slug = 'proteccion-solar' AND image IS NULL;

-- Create site_content table for full CMS page editing
CREATE TABLE IF NOT EXISTS yedam_site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_name VARCHAR(100) NOT NULL,
    section_key VARCHAR(255) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_name, section_key)
);

-- Add RLS (Row Level Security) policies if not already enabled
ALTER TABLE yedam_site_content ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access (adjust as needed for your auth setup)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'yedam_site_content' AND policyname = 'Admin full access to site content'
    ) THEN
        CREATE POLICY "Admin full access to site content"
            ON yedam_site_content
            FOR ALL
            USING (true);
    END IF;
END $$;

-- Seed initial site content for the home page
INSERT INTO yedam_site_content (id, page_name, section_key, content) VALUES
('a1000000-0000-0000-0000-000000000001', 'home', 'hero', '{
    "titleLine1": "Tu belleza.",
    "titleLine2": "Tu ritual.",
    "titleLine3": "Tu momento.",
    "subtitle": "Cosméticos coreanos auténticos seleccionados para cada etapa de tu cuidado facial. Fórmulas botânicas que revelan tu luminosidad natural.",
    "btnBuyText": "COMPRAR AHORA",
    "btnBuyLink": "/tienda",
    "btnRoutineText": "DESCUBRIR RUTINAS",
    "btnRoutineLink": "/rutinas",
    "bgImage": "/images/banner.png"
}'::jsonb),
('a1000000-0000-0000-0000-000000000002', 'home', 'highlights', '{
    "items": [
        {"icon": "ShieldCheck", "title": "100% ORIGINALES", "text": "Directo desde Corea"},
        {"icon": "Truck", "title": "ENVÍOS INTERNACIONALES", "text": "A toda América Latina"},
        {"icon": "ShieldAlert", "title": "PASOS SEGUROS", "text": "Protegemos tu compra"},
        {"icon": "Heart", "title": "ATENCIÓN PERSONALIZADA", "text": "Estamos para ayudarte"}
    ]
}'::jsonb),
('a1000000-0000-0000-0000-000000000003', 'home', 'categories', '{
    "preTitle": "Colección Curada",
    "title": "Descubre lo mejor del K-Beauty",
    "subtitle": "Productos auténticos para realzar tu belleza natural.",
    "buttonText": "VER TODAS LAS CATEGORÍAS"
}'::jsonb),
('a1000000-0000-0000-0000-000000000004', 'home', 'bestSellers', '{
    "preTitle": "Favoritos de la Comunidad",
    "title": "Más vendidos",
    "subtitle": "Los favoritos de nuestra comunidad internacional. Fórmulas probadas que entregan resultados visibles.",
    "buttonText": "VER TODOS"
}'::jsonb),
('a1000000-0000-0000-0000-000000000005', 'home', 'experiencias', '{
    "preTitle": "Experiencias Yedam",
    "title": "Vive la belleza coreana más allá de los productos",
    "cards": [
        {"badge": "YEDAM EXPERIENCE", "badgeColor": "accent", "title": "Prueba, siente y descubre.", "text": "Damos a probar productos exclusivos en experiencias únicas en Corea del Sur.", "buttonText": "SABER MÁS", "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400"},
        {"badge": "EN COLABORACIÓN CON MAEUM", "badgeColor": "blue", "title": "Viajes que transforman.", "text": "Viaja a Corea y vive la cultura, la belleza y el bienestar de una forma auténtica.", "buttonText": "EXPLORAR VIAJES", "image": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=400"},
        {"badge": "BEAUTY & CULTURA", "badgeColor": "accent", "title": "Más que belleza, una conexión.", "text": "Sumérgete en la cultura coreana y descubre el origen de tu rutina de belleza.", "buttonText": "VER EXPERIENCIAS", "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400"}
    ]
}'::jsonb),
('a1000000-0000-0000-0000-000000000006', 'home', 'routines', '{
    "preTitle": "Tratamientos Específicos",
    "title": "Rutinas para cada necesidad",
    "subtitle": "Encuentra la rutina ideal para tu tipo de piel y estilo de vida.",
    "buttonText": "VER TODAS LAS RUTINAS",
    "items": [
        {"name": "Piel Hidratada", "icon": "Droplet"},
        {"name": "Piel Iluminada", "icon": "Sparkles"},
        {"name": "Piel Sensible", "icon": "Smile"},
        {"name": "Anti-acné", "icon": "ShieldCheck"},
        {"name": "Anti-edad", "icon": "Hourglass"},
        {"name": "Rutina Completa", "icon": "ClipboardList"}
    ],
    "badges": [
        {"icon": "ShieldCheck", "title": "Ingredientes seguros"},
        {"icon": "Droplet", "title": "Fórmulas efectivas"},
        {"icon": "Star", "title": "Resultados reales"},
        {"icon": "Compass", "title": "Inspirado en la tradición"},
        {"icon": "Smile", "title": "Desarrollado con ciencia"}
    ]
}'::jsonb),
('a1000000-0000-0000-0000-000000000007', 'home', 'instagram', '{
    "title": "Únete a nuestra comunidad",
    "subtitle": "Tips, rutinas, lanzamientos y mucho más en Instagram.",
    "buttonText": "SEGUIR EN INSTAGRAM",
    "buttonLink": "https://instagram.com/yedam.kbeauty",
    "images": [
        "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400",
        "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400",
        "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=400",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400",
        "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400"
    ]
}'::jsonb),
('a1000000-0000-0000-0000-000000000008', 'home', 'newsletter', '{
    "preTitle": "YEDAM CLUB",
    "title": "Sé la primera en descubrir nuevos lanzamientos y ofertas.",
    "buttonText": "SUBSCRIBIRSE",
    "successMessage": "✓ ¡Te has suscrito con éxito!"
}'::jsonb),
('a1000000-0000-0000-0000-000000000009', 'header', 'main', '{
    "announcementText": "Belleza que nace de la tradición. Cosmética que transforma.",
    "shippingText": "Envíos para toda América Latina",
    "attentionText": "Atención",
    "logoUrl": "/images/logo.png"
}'::jsonb),
('a1000000-0000-0000-0000-000000000010', 'footer', 'main', '{
    "description": "Importamos los cosméticos coreanos más exclusivos y galardonados a nivel internacional para transformar tu rutina diaria de skincare en un ritual de lujo.",
    "social": {
        "instagram": "https://instagram.com/yedam.kbeauty",
        "youtube": "https://youtube.com/yedam.kbeauty"
    }
}'::jsonb)
ON CONFLICT (page_name, section_key) DO NOTHING;

-- Update existing products with image URLs for compatibility
UPDATE yedam_products SET image = 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400' WHERE sku = 'RL-DK-1025' AND image IS NULL;
UPDATE yedam_products SET image = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400' WHERE sku = 'BJ-GD-0030' AND image IS NULL;
UPDATE yedam_products SET image = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400' WHERE sku = 'CX-AM-0100' AND image IS NULL;
UPDATE yedam_products SET image = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400' WHERE sku = 'AN-HT-0250' AND image IS NULL;
UPDATE yedam_products SET image = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400' WHERE sku = 'SK-MC-0055' AND image IS NULL;
