// Local In-Memory Database Engine for Cheotnun K-Beauty
// Syncs with Supabase when available, falls back to localStorage
interface DbState {
  users: any[];
  categories: any[];
  brands: any[];
  products: any[];
  product_images: any[];
  addresses: any[];
  orders: any[];
  order_items: any[];
  order_tracking: any[];
  communication_logs: any[];
  favorites: any[];
  routines: any[];
  cms_blocks: any[];
  site_content: Record<string, any>;
  system_settings: Record<string, any>;
  coupons: any[];
  blog_posts: any[];
  newsletter_subscribers: any[];
  subscriptions: any[];
}

const STORAGE_KEY = 'cheotnun_db_state';
const DELETED_IDS_KEY = 'cheotnun_deleted_ids';
const SEED_VERSION = 'v2';

const DEFAULT_STATE: DbState = {
  users: [
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', email: 'admin@cheotnun.com', name: 'Super Administrador Cheotnun', role: 'super_admin' },
    { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', email: 'cliente@example.com', name: 'Jaque Customer', role: 'customer' }
  ],
  categories: [
    { id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Cuidado Facial', slug: 'cuidado-facial', description: 'Produtos de limpeza, tônicos, séruns e hidratantes para o rosto.', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400' },
    { id: '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Cuidado Corporal', slug: 'cuidado-corporal', description: 'Hidratação e tratamento para todo o corpo.', image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400' },
    { id: '30eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Cuidado Capilar', slug: 'cuidado-capilar', description: 'Shampoos, condicionadores e máscaras capilares.', image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=400' },
    { id: '40eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', name: 'Maquillaje', slug: 'maquillaje', description: 'Bases, corretivos, batons e maquiagens premium.', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400' },
    { id: '50eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', name: 'Cuidado de Uñas', slug: 'cuidado-de-unas', description: 'Esmaltes e fortalecedores de unhas.', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400' },
    { id: '60eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', name: 'Protección Solar', slug: 'proteccion-solar', description: 'Protetores solares faciais e corporais de alta tecnologia.', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400' }
  ],
  brands: [
    { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Round Lab', slug: 'round-lab', description: 'Produtos formulados com água do fundo do mar e ingredientes naturais.', is_featured: true },
    { id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', name: 'Beauty of Joseon', slug: 'beauty-of-joseon', description: 'Cosméticos inspirados na medicina tradicional coreana (Hanbang).', is_featured: true },
    { id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', name: 'COSRX', slug: 'cosrx', description: 'Produtos focados em alta performance e ingredientes ativos como Centella e Baba de Caracol.', is_featured: true },
    { id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', name: 'Anua', slug: 'anua', description: 'Fórmula limpa e minimalista para acalmar a barreira da pele.', is_featured: true },
    { id: '70eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', name: 'Skin1004', slug: 'skin1004', description: 'Produtos baseados em extrato puro de Centella Asiática de Madagascar.', is_featured: true }
  ],
  products: [
    { id: '11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11', sku: 'RL-DK-1025', name: '1025 Dokdo Cleanser', slug: '1025-dokdo-cleanser', description: 'Limpiador facial suave que elimina impurezas y mantiene la hidratación.', description_en: 'Gentle facial cleanser that removes impurities and maintains hydration.', price: 18.00, price_promo: 16.20, price_brl: 90.00, price_promo_brl: 81.00, weight: 0.15, volume: '150ml', stock: 120, hs_code: '3304.99.90', status: 'active', brand_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', category_id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400' },
    { id: '22ebc999-9c0b-4ef8-bb6d-6bb9bd380a22', sku: 'BJ-GD-0030', name: 'Glow Deep Serum: Rice + Alpha-Arbutin', slug: 'glow-deep-serum-rice-alpha-arbutin', description: 'Sérum iluminador diseñado para combatir la pigmentación y unificar el tono.', description_en: 'Brightening serum designed to fight pigmentation and unify tone.', price: 22.90, price_promo: 19.90, price_brl: 114.50, price_promo_brl: 99.50, weight: 0.08, volume: '30ml', stock: 85, hs_code: '3304.99.90', status: 'active', brand_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', category_id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400' },
    { id: '33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33', sku: 'CX-AM-0100', name: 'Advanced Snail 96 Mucin Power Essence', slug: 'advanced-snail-96-mucin-power-essence', description: 'Esencia nutritiva de baba de caracol para reparar la barrera cutánea.', description_en: 'Nutritive snail mucin essence to repair the skin barrier.', price: 19.00, price_promo: 18.00, price_brl: 95.00, price_promo_brl: 90.00, weight: 0.18, volume: '100ml', stock: 150, hs_code: '3304.99.90', status: 'active', brand_id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', category_id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400' },
    { id: '44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44', sku: 'AN-HT-0250', name: 'Heartleaf 77% Soothing Toner', slug: 'heartleaf-77-soothing-toner', description: 'Tónico calmante ideal para pieles sensibles y con tendencia al acné.', description_en: 'Soothing toner ideal for sensitive and acne-prone skin.', price: 21.00, price_promo: 19.50, price_brl: 105.00, price_promo_brl: 97.50, weight: 0.30, volume: '250ml', stock: 90, hs_code: '3304.99.90', status: 'active', brand_id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', category_id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400' },
    { id: '55ebc999-9c0b-4ef8-bb6d-6bb9bd380a55', sku: 'SK-MC-0055', name: 'Madagascar Centella Ampoule', slug: 'madagascar-centella-ampoule', description: 'Ampolla calmante 100% de Centella Asiática para reparar e hidratar.', description_en: 'Soothing 100% Centella Asiatica ampoule to repair and hydrate.', price: 23.00, price_promo: 21.00, price_brl: 115.00, price_promo_brl: 105.00, weight: 0.12, volume: '55ml', stock: 200, hs_code: '3304.99.90', status: 'active', brand_id: '70eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', category_id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400' }
  ],
  product_images: [],
  addresses: [
    { id: 'addr-1', user_id: 'a0000000-0000-4000-a000-000000000001', address_type: 'shipping', first_name: 'Jaque', last_name: 'Customer', street: 'Gran Via', number: '123', complement: 'Apt 4B', city: 'Madrid', state: 'Madrid', postal_code: '28013', country: 'España', phone: '+34600111222', document_type: 'nif', document_number: '12345678Z' }
  ],
  orders: [
    {
      id: 'ord-001', customer_id: 'a0000000-0000-4000-a000-000000000001', status: 'aguardando_confirmacao', items: [{ product_id: '11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11', name: '1025 Dokdo Cleanser', quantity: 2, price: 18.00 }],
      subtotal: 36.00, shipping_amount: 15.00, discount_amount: 0, total_amount: 51.00, gateway: 'stripe', carrier: null, tracking_code: null, document_type: 'nif', document_number: '12345678Z', commercial_invoice_url: '/invoices/cheotnun-inv-ord-001.pdf',
      shipping_address: { first_name: 'Jaque', last_name: 'Customer', street: 'Gran Via', number: '123', city: 'Madrid', state: 'Madrid', country: 'España' },
      billing_address: { first_name: 'Jaque', last_name: 'Customer', street: 'Gran Via', number: '123', city: 'Madrid', state: 'Madrid', country: 'España' },
      created_at: new Date(Date.now() - 0 * 86400000).toISOString(), updated_at: new Date().toISOString()
    },
    {
      id: 'ord-002', customer_id: 'a0000000-0000-4000-a000-000000000002', status: 'aguardando_confirmacao', items: [{ product_id: '22ebc999-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Glow Deep Serum', quantity: 1, price: 22.90 }],
      subtotal: 22.90, shipping_amount: 15.00, discount_amount: 0, total_amount: 37.90, gateway: 'stripe', carrier: null, tracking_code: null, document_type: 'nif', document_number: '87654321X', commercial_invoice_url: '/invoices/cheotnun-inv-ord-002.pdf',
      shipping_address: { first_name: 'Jaque', last_name: 'Customer', street: 'Gran Via', number: '123', city: 'Madrid', state: 'Madrid', country: 'España' },
      billing_address: { first_name: 'Jaque', last_name: 'Customer', street: 'Gran Via', number: '123', city: 'Madrid', state: 'Madrid', country: 'España' },
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(), updated_at: new Date().toISOString()
    },
    {
      id: 'ord-003', customer_id: 'a0000000-0000-4000-a000-000000000003', status: 'aguardando_confirmacao', items: [{ product_id: '33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Advanced Snail 96 Mucin Power Essence', quantity: 1, price: 19.00 }],
      subtotal: 19.00, shipping_amount: 15.00, discount_amount: 0, total_amount: 34.00, gateway: 'paypal', carrier: null, tracking_code: null, document_type: 'nie', document_number: 'Y1234567Z', commercial_invoice_url: '/invoices/cheotnun-inv-ord-003.pdf',
      shipping_address: { first_name: 'Jaque', last_name: 'Customer', street: 'Gran Via', number: '123', city: 'Madrid', state: 'Madrid', country: 'España' },
      billing_address: { first_name: 'Jaque', last_name: 'Customer', street: 'Gran Via', number: '123', city: 'Madrid', state: 'Madrid', country: 'España' },
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(), updated_at: new Date().toISOString()
    },
    {
      id: 'ord-004', customer_id: 'a0000000-0000-4000-a000-000000000004', status: 'preparando_envio', items: [{ product_id: '44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44', name: 'Heartleaf 77% Soothing Toner', quantity: 2, price: 21.00 }, { product_id: '55ebc999-9c0b-4ef8-bb6d-6bb9bd380a55', name: 'Madagascar Centella Ampoule', quantity: 1, price: 23.00 }],
      subtotal: 65.00, shipping_amount: 15.00, discount_amount: 5.00, total_amount: 75.00, gateway: 'stripe', carrier: 'DHL', tracking_code: 'LX123456789KR', document_type: 'ci', document_number: '1234567-8', commercial_invoice_url: '/invoices/cheotnun-inv-ord-004.pdf',
      shipping_address: { first_name: 'Maria', last_name: 'Rodriguez', street: 'Avenida Paulista', number: '1000', city: 'São Paulo', state: 'SP', country: 'Brasil' },
      billing_address: { first_name: 'Maria', last_name: 'Rodriguez', street: 'Avenida Paulista', number: '1000', city: 'São Paulo', state: 'SP', country: 'Brasil' },
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(), updated_at: new Date().toISOString()
    },
    {
      id: 'ord-005', customer_id: 'a0000000-0000-4000-a000-000000000005', status: 'enviado', items: [{ product_id: '11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11', name: '1025 Dokdo Cleanser', quantity: 3, price: 18.00 }],
      subtotal: 54.00, shipping_amount: 15.00, discount_amount: 0, total_amount: 69.00, gateway: 'stripe', carrier: 'FedEx', tracking_code: 'FX987654321KR', document_type: 'nif', document_number: 'A12345678', commercial_invoice_url: '/invoices/cheotnun-inv-ord-005.pdf',
      shipping_address: { first_name: 'Sofia', last_name: 'Fernandez', street: 'Calle Serrano', number: '45', city: 'Madrid', state: 'Madrid', country: 'España' },
      billing_address: { first_name: 'Sofia', last_name: 'Fernandez', street: 'Calle Serrano', number: '45', city: 'Madrid', state: 'Madrid', country: 'España' },
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(), updated_at: new Date().toISOString()
    },
    {
      id: 'ord-006', customer_id: 'a0000000-0000-4000-a000-000000000006', status: 'entregue', items: [{ product_id: '55ebc999-9c0b-4ef8-bb6d-6bb9bd380a55', name: 'Madagascar Centella Ampoule', quantity: 2, price: 23.00 }],
      subtotal: 46.00, shipping_amount: 15.00, discount_amount: 0, total_amount: 61.00, gateway: 'paypal', carrier: 'EMS Korea', tracking_code: 'EM555555555KR', document_type: 'nif', document_number: 'B98765432', commercial_invoice_url: '/invoices/cheotnun-inv-ord-006.pdf',
      shipping_address: { first_name: 'Ana', last_name: 'Lopez', street: 'Calle Mayor', number: '10', city: 'Barcelona', state: 'Cataluña', country: 'España' },
      billing_address: { first_name: 'Ana', last_name: 'Lopez', street: 'Calle Mayor', number: '10', city: 'Barcelona', state: 'Cataluña', country: 'España' },
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(), updated_at: new Date().toISOString()
    },
    {
      id: 'ord-007', customer_id: 'a0000000-0000-4000-a000-000000000007', status: 'enviado', items: [{ product_id: '33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Advanced Snail 96 Mucin Power Essence', quantity: 1, price: 19.00 }, { product_id: '44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44', name: 'Heartleaf 77% Soothing Toner', quantity: 1, price: 21.00 }],
      subtotal: 40.00, shipping_amount: 15.00, discount_amount: 0, total_amount: 55.00, gateway: 'stripe', carrier: 'DHL Express', tracking_code: 'DH333333333KR', document_type: 'rut', document_number: '12.345.678-9', commercial_invoice_url: '/invoices/cheotnun-inv-ord-007.pdf',
      shipping_address: { first_name: 'Carlos', last_name: 'Mendoza', street: 'Carrera 7', number: '45-20', city: 'Bogotá', state: 'Cundinamarca', country: 'Colombia' },
      billing_address: { first_name: 'Carlos', last_name: 'Mendoza', street: 'Carrera 7', number: '45-20', city: 'Bogotá', state: 'Cundinamarca', country: 'Colombia' },
      created_at: new Date(Date.now() - 45 * 86400000).toISOString(), updated_at: new Date().toISOString()
    },
  ],
  order_items: [],
  order_tracking: [],
  communication_logs: [],
  favorites: [],
  routines: [
    {
      id: 'routine-1',
      title: 'Rutina Hidratante y Calmante',
      slug: 'rutina-hidratante-calmante',
      description: 'Rutina de día recomendada para pieles secas y sensibles.',
      skin_type: 'Piel Sensible',
      steps: [
        { step: 1, action: 'Limpieza', product_id: '11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11', instruction: 'Limpiar suavemente el rostro con agua tibia.' },
        { step: 2, action: 'Tonificación', product_id: '44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44', instruction: 'Aplicar a golpecitos con las manos.' },
        { step: 3, action: 'Ampolla', product_id: '55ebc999-9c0b-4ef8-bb6d-6bb9bd380a55', instruction: 'Aplicar una pipeta completa y esparcir.' },
        { step: 4, action: 'Hidratación y Reparación', product_id: '33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33', instruction: 'Masajear para sellar la hidratación.' }
      ],
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'active'
    }
  ],
  cms_blocks: [
    {
      id: 'block-hero',
      page_name: 'home',
      section_id: 'hero',
      block_type: 'hero',
      content: {
        title: 'Tu belleza. Tu ritual. Tu momento.',
        subtitle: 'Cosméticos coreanos auténticos para cada etapa de tu cuidado.',
        btnBuyText: 'COMPRAR AHORA',
        btnBuyLink: '/tienda',
        btnRoutineText: 'DESCUBRIR RUTINAS',
        btnRoutineLink: '/rutinas',
        bgImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1920'
      },
      sort_order: 0,
      active: true
    },
    {
      id: 'block-features',
      page_name: 'home',
      section_id: 'features',
      block_type: 'features',
      content: {
        items: [
          { icon: 'ShieldCheck', title: '100% ORIGINALES', text: 'Directo desde Corea' },
          { icon: 'Truck', title: 'ENVÍOS INTERNACIONALES', text: 'A toda América Latina' },
          { icon: 'ShieldAlert', title: 'PAGOS SEGUROS', text: 'Protegemos tu compra' },
          { icon: 'Heart', title: 'ATENCIÓN PREMIUM', text: 'Estamos para ayudarte' }
        ]
      },
      sort_order: 1,
      active: true
    }
  ],
  site_content: {
    home: {
      hero: {
        titleLine1: 'Tu belleza.',
        titleLine2: 'Tu ritual.',
        titleLine3: 'Tu momento.',
        subtitle: 'Cosméticos coreanos auténticos seleccionados para cada etapa de tu cuidado facial. Fórmulas botánicas que revelan tu luminosidad natural.',
        btnBuyText: 'COMPRAR AHORA',
        btnBuyLink: '/tienda',
        btnRoutineText: 'DESCUBRIR RUTINAS',
        btnRoutineLink: '/rutinas',
        bgImage: '/images/banner.webp'
      },
      highlights: {
        items: [
          { icon: 'ShieldCheck', title: '100% ORIGINALES', text: 'Directo desde Corea' },
          { icon: 'Truck', title: 'ENVÍOS INTERNACIONALES', text: 'A toda América Latina' },
          { icon: 'ShieldAlert', title: 'PASOS SEGUROS', text: 'Protegemos tu compra' },
          { icon: 'Heart', title: 'ATENCIÓN PERSONALIZADA', text: 'Estamos para ayudarte' }
        ]
      },
      categories: {
        preTitle: 'Colección Curada',
        title: 'Descubre lo mejor del K-Beauty',
        subtitle: 'Productos auténticos para realzar tu belleza natural.',
        buttonText: 'VER TODAS LAS CATEGORÍAS'
      },
      bestSellers: {
        preTitle: 'Favoritos de la Comunidad',
        title: 'Más vendidos',
        subtitle: 'Los favoritos de nuestra comunidad internacional. Fórmulas probadas que entregan resultados visibles.',
        buttonText: 'VER TODOS'
      },
      experiencias: {
        preTitle: 'Experiencias Cheotnun',
        title: 'Vive la belleza coreana más allá de los productos',
        cards: [
          {
            badge: 'CHEOTNUN EXPERIENCE',
            badgeColor: 'accent',
            title: 'Prueba, siente y descubre.',
            text: 'Damos a probar productos exclusivos en experiencias únicas en Corea del Sur.',
            buttonText: 'SABER MÁS',
            image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400'
          },
          {
            badge: 'EN COLABORACIÓN CON MAEUM',
            badgeColor: 'blue',
            title: 'Viajes que transforman.',
            text: 'Viaja a Corea y vive la cultura, la belleza y el bienestar de una forma auténtica.',
            buttonText: 'EXPLORAR VIAJES',
            image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=400'
          },
          {
            badge: 'BEAUTY & CULTURA',
            badgeColor: 'accent',
            title: 'Más que belleza, una conexión.',
            text: 'Sumérgete en la cultura coreana y descubre el origen de tu rutina de belleza.',
            buttonText: 'VER EXPERIENCIAS',
            image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400'
          }
        ]
      },
      routines: {
        preTitle: 'Tratamientos Específicos',
        title: 'Rutinas para cada necesidad',
        subtitle: 'Encuentra la rutina ideal para tu tipo de piel y estilo de vida.',
        buttonText: 'VER TODAS LAS RUTINAS',
        items: [
          { name: 'Piel Hidratada', icon: 'Droplet' },
          { name: 'Piel Iluminada', icon: 'Sparkles' },
          { name: 'Piel Sensible', icon: 'Smile' },
          { name: 'Anti-acné', icon: 'ShieldCheck' },
          { name: 'Anti-edad', icon: 'Hourglass' },
          { name: 'Rutina Completa', icon: 'ClipboardList' }
        ],
        badges: [
          { icon: 'ShieldCheck', title: 'Ingredientes seguros' },
          { icon: 'Droplet', title: 'Fórmulas efectivas' },
          { icon: 'Star', title: 'Resultados reales' },
          { icon: 'Compass', title: 'Inspirado en la tradición' },
          { icon: 'Smile', title: 'Desarrollado con ciencia' }
        ]
      },
      instagram: {
        title: 'Únete a nuestra comunidad',
        subtitle: 'Tips, rutinas, lanzamientos y mucho más en Instagram.',
        buttonText: 'SEGUIR EN INSTAGRAM',
        buttonLink: 'https://instagram.com/cheotnun.kbeauty',
        images: [
          'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400',
          'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400',
          'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=400',
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400',
          'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400'
        ]
      },
      newsletter: {
        preTitle: 'CHEOTNUN CLUB',
        title: 'Sé la primera en descubrir nuevos lanzamientos y ofertas.',
        buttonText: 'SUSCRIBIRSE',
        successMessage: '✓ ¡Te has suscrito con éxito! Bienvenido al Cheotnun Club.'
      }
    },
    header: {
      announcementText: 'Belleza que nace de la tradición. Cosmética que transforma.',
      shippingText: 'Envíos para toda América Latina',
      attentionText: 'Atención',
      logoUrl: '/images/cheotnun-logo.webp'
    },
    footer: {
      description: 'Importamos los cosméticos coreanos más exclusivos y galardonados a nivel internacional para transformar tu rutina diaria de skincare en un ritual de lujo.',
      social: {
        instagram: 'https://instagram.com/cheotnun.kbeauty',
        youtube: 'https://www.youtube.com/@enquantoaconteceoficial/featured',
        tiktok: 'https://www.tiktok.com/@lacheotnun'
      },
      columns: [
        {
          title: 'Tienda',
          links: [
            { label: 'Todos los productos', href: '/tienda' },
            { label: 'Cuidado Facial', href: '/tienda?category=cuidado-facial' },
            { label: 'Protección Solar', href: '/tienda?category=proteccion-solar' },
            { label: 'Cómo funciona', href: '/como-funciona' },
            { label: 'Rutinas Recomendadas', href: '/rutinas' },
            { label: 'Blog', href: '/blog' }
          ]
        },
        {
          title: 'Ayuda & Políticas',
          links: [
            { label: 'Envíos y Entregas', href: '/ayuda/envios' },
            { label: 'Cambios y Devoluciones', href: '/ayuda/devoluciones' },
            { label: 'Contacto', href: '/contacto' },
            { label: 'Política de Privacidad', href: '/politica-de-privacidad' },
            { label: 'Términos y Condiciones', href: '/terminos' }
          ]
        },
        {
          title: 'Atención al Cliente',
          links: [
            { label: 'WhatsApp: +34 600 111 222', href: 'https://wa.me/34600111222', icon: 'MessageCircle' },
            { label: 'sac@cheotnun.com', href: 'mailto:sac@cheotnun.com', icon: 'Mail' },
            { label: 'Calle Gran Vía 12, Madrid, España', href: '#', icon: 'MapPin' }
          ]
        }
      ],
      marcas: {
        testimonials: {
          title: 'Lo que dicen nuestras clientas',
          buttonText: 'VER MÁS OPINIONES',
          buttonLink: 'https://www.instagram.com/lacheotnun',
          list: [
            { name: 'María G.', text: 'Los productos llegaron super bien empacados y antes del tiempo estimado. ¡Todo 100% original!', country: 'México', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150' },
            { name: 'Carolina R.', text: 'Me encanta la atención, siempre me ayudan a elegir lo mejor para mi piel. ¡Recomendadísimas!', country: 'Chile', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150' },
            { name: 'Valeria P.', text: 'Cheotnun se ha convertido en mi tienda favorita de K-Beauty.', country: 'Colombia', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150' },
            { name: 'Daniela S.', text: 'La calidad de los productos es impecable. Se nota todo el cuidado en cada detalle.', country: 'Argentina', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=150' }
          ]
        },
        trustBadges: [
          { icon: 'Leaf', text: 'Ingredientes seguros\ny efectivos' },
          { icon: 'FlaskConical', text: 'Fórmulas probadas\ndermatológicamente' },
          { icon: 'Rabbit', text: 'No testeado\nen animales' },
          { icon: 'Recycle', text: 'Empaques responsables\ny reciclables' },
          { icon: 'Flower2', text: 'Inspirado en la tradición,\nmejorado por la ciencia' }
        ],
        hero: {
          title: 'Marcas Coreanas',
          subtitle: 'Trabajamos con las mejores marcas de Corea del Sur para ofrecerte lo mejor en cuidado de la piel.',
          image: '/images/marcas-coreanas.webp'
        },
        features: [
          { title: 'Marcas auténticas', text: 'Productos 100% originales comprados directamente en Corea del Sur.', icon: 'Award' },
          { title: 'Innovación y calidad', text: 'Marcas reconocidas por su tecnología avanzada y resultados comprobados.', icon: 'Beaker' },
          { title: 'Belleza consciente', text: 'Fórmulas seguras, ingredientes eficaces y respeto por tu piel y el medio ambiente.', icon: 'Heart' }
        ],
        whyChooseUs: {
          title: '¿Por qué elegir Cheotnun?',
          items: [
            { title: 'Productos 100% originales', text: 'Garantizamos autenticidad en cada producto.', icon: 'ShieldCheck' },
            { title: 'Compra directa en Corea', text: 'Seleccionamos y compramos personalmente para ti.', icon: 'ShoppingBag' },
            { title: 'Atención personalizada', text: 'Te acompañamos en todo el proceso de compra.', icon: 'Headset' },
            { title: 'Selección exclusiva', text: 'Productos elegidos con criterio y mucho cariño.', icon: 'Gift' }
          ],
          conclusionTitle: 'Seleccionamos con amor, entregamos con confianza.',
          conclusionText: 'Nuestro compromiso es que vivas la mejor experiencia de K-Beauty, desde Corea hasta ti.',
          image: '/images/why-choose-us.webp'
        }
      },
      comoFunciona: {
        hero: {
          title: 'Cómo funciona',
          subtitle: 'Hemos simplificado cada paso para que tu experiencia de compra sea segura, práctica y confiable.',
          image: '/images/como-funciona-hero.webp'
        },
        steps: [
          { number: '01', title: 'Eliges\ntus productos', text: 'Explora nuestra tienda\ny selecciona tus favoritos.' },
          { number: '02', title: 'Procesamos\ntu pedido', text: 'Preparamos todo con\nmucho cuidado desde Corea.' },
          { number: '03', title: 'Enviamos\na tu país', text: 'Envío internacional\nseguro y con seguimiento.' },
          { number: '04', title: 'Recibes\ny disfrutas', text: 'Tu rutina de K-Beauty\nlista para usar.' }
        ],
        paymentsInfo: {
          title: 'Formas de pago',
          subtitle: 'Seguridad y flexibilidad para ti.',
          logos: ['Visa', 'Mastercard', 'Amex', 'PayPal']
        },
        shippingInfo: {
          title: 'Envíos internacionales',
          subtitle: 'Llegamos a toda América Latina.',
          items: [
            { title: 'Envíos seguros y rastreables', text: 'Trabajamos con transportadoras confiables para que tu pedido llegue hasta ti.' },
            { title: 'Tiempo estimado de entrega', text: 'De 7 a 20 días hábiles, dependiendo de tu país.' },
            { title: 'Te mantenemos informada', text: 'Recibirás tu número de seguimiento para acompañar cada paso de tu pedido.' }
          ]
        },
        faq: {
          title: 'Preguntas frecuentes',
          subtitle: 'Resolvemos tus dudas más comunes.',
          buttonText: 'VER TODAS LAS PREGUNTAS',
          items: [
            '¿Los productos son originales?',
            '¿Cuánto tarda en llegar mi pedido?',
            '¿Hacen envíos a mi país?',
            '¿Puedo cambiar o devolver un producto?',
            '¿Qué métodos de pago aceptan?',
            '¿Cómo sé el estado de mi pedido?'
          ]
        },
        promises: {
          title: 'Productos 100 % originales',
          subtitle: 'Solo trabajamos con marcas coreanas auténticas y autorizadas. Garantizamos la calidad y procedencia de cada producto que llega a tus manos.',
          image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600',
          items: [
            { icon: 'ShieldCheck', title: 'Marcas oficiales' },
            { icon: 'Box', title: 'Compra directa en Corea del Sur' },
            { icon: 'CheckCircle2', title: 'Productos certificados' },
            { icon: 'Leaf', title: 'Frescura y calidad garantizadas' }
          ]
        },
        community: {
          title: 'Únete a nuestra comunidad',
          desc: 'Descubre rutinas, tips, lanzamientos y mucho más en Instagram.',
          buttonText: 'SEGUIR EN INSTAGRAM',
          buttonLink: 'https://instagram.com/cheotnun.kbeauty',
          images: [
            'https://images.unsplash.com/photo-1615397323281-a6cecd55dbf7?q=80&w=300',
            'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=300',
            'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=300',
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300'
          ]
        },
        newsletter: {
          title: 'Sé la primera en enterarte',
          subtitle: 'Nuevos lanzamientos, ofertas exclusivas y contenido especial directamente en tu correo.',
          placeholder: 'Tu correo electrónico',
          buttonText: 'SUSCRIBIRME',
          disclaimer: 'Prometemos no enviar spam. Solo compartimos lo mejor del K-Beauty.'
        }
      },
      contacto: {
        hero: {
          image: '/images/cheotnun-k-beauty-contato-atendimento.webp',
          title: 'Estamos aquí\npara ti',
          subtitle: '¿Tienes preguntas, necesitas ayuda con tu pedido o quieres más información sobre nuestros productos? Nuestro equipo está listo para ayudarte.',
          buttonText: 'RESPUESTA RÁPIDA Y PERSONALIZADA',
          badges: [
            { icon: 'Clock', text: 'Atención en español' },
            { icon: 'Clock', text: 'Respuesta en menos de 24h' },
            { icon: 'CheckCircle2', text: 'Tu satisfacción es nuestra prioridad' }
          ]
        },
        contactMethods: {
          title: 'Formas de contacto',
          whatsapp: { label: 'Chat en vivo', value: 'WhatsApp: +34 600 111 222', time: 'Lunes a Viernes, 9:00 - 18:00', desc: 'La forma más rápida de hablar con nuestro equipo.', btn: 'ESCRIBIR AHORA', link: '#contacto-form' },
          email: { label: 'Envíanos un correo', value: 'sac@cheotnun.com', time: 'Respuesta en menos de 24h', desc: 'Envíanos un e-mail y te responderemos pronto.', btn: 'ENVIAR E-MAIL', link: 'mailto:hola@cheotnun.com' },
          instagram: { label: 'Instagram', value: '@cheotnun.kbeauty', time: '', desc: 'Envíanos un mensaje directo en Instagram.', btn: 'IR AL INSTAGRAM', link: 'https://instagram.com/cheotnun.kbeauty' },
          hours: { label: 'Horario de atención', value: 'Excepto feriados', time: '', desc: 'Lunes a viernes 9:00 a 18:00 (GMT-3)', btn: 'VER HORARIOS', link: '#' },
          address: { label: 'Sede Principal', value: 'Seúl, Corea del Sur', time: '', desc: 'Oficina administrativa', btn: 'VER EN EL MAPA', link: '#' }
        },
        form: {
          title: 'Envíanos un mensaje',
          nameLabel: 'Nombre completo',
          emailLabel: 'E-mail',
          subjectLabel: 'Asunto',
          subjectOptions: ['Selecciona un asunto', 'Dudas sobre productos', 'Estado de mi pedido', 'Devoluciones', 'Otros'],
          messageLabel: 'Tu mensaje',
          submitText: 'ENVIAR MENSAJE',
          securityNotice: 'Tu información está segura con nosotros y no será compartida.',
          successAlert: '¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.'
        },
        faq: {
          title: '¿En qué podemos ayudarte?',
          subtitle: 'Preguntas frecuentes rápidas',
          buttonText: 'VER TODAS LAS PREGUNTAS FRECUENTES',
          topics: [
            { icon: 'Info', title: 'Información sobre productos', desc: 'Dudas sobre ingredientes, beneficios y recomendaciones.' },
            { icon: 'PackageSearch', title: 'Pedidos y envíos', desc: 'Consulta sobre el estado de tu pedido, envíos y entregas.' },
            { icon: 'CreditCard', title: 'Pagos y facturación', desc: 'Información sobre métodos de pago, facturas y reembolsos.' },
            { icon: 'RefreshCw', title: 'Devoluciones y cambios', desc: 'Dudas sobre cambios, devoluciones y garantías.' },
            { icon: 'Handshake', title: 'Colaboraciones y prensa', desc: 'Propuestas de colaboración, eventos y prensa.' }
          ],
          quickItems: [
            '¿Cuánto tiempo tarda en llegar mi pedido?',
            '¿Qué métodos de pago aceptan?',
            '¿Realizan envíos a mi país?',
            '¿Puedo cambiar o devolver un producto?'
          ]
        },
        community: {
          title: 'Únete a nuestra comunidad',
          desc: 'Síguenos en nuestras redes sociales y sé la primera en descubrir lanzamientos, promociones y consejos de belleza.',
          buttonText: 'SEGUIR EN INSTAGRAM',
          buttonLink: 'https://instagram.com/cheotnun.kbeauty',
          images: [
            'https://images.unsplash.com/photo-1615397323281-a6cecd55dbf7?q=80&w=300',
            'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=300',
            'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=300',
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300'
          ]
        }
      },
      ayudaDevoluciones: {
        hero: {
          badge: 'Política de Devolución',
          title: 'Cambios y Devoluciones',
          subtitle: 'Compra con confianza. Tienes 14 días para devolver tus productos sin compromiso.',
          steps: [
            { step: '01', icon: 'Clock', title: 'Solicitud (14 días)', desc: 'Tienes 14 días naturales desde la recepción para solicitar la devolución. Escríbenos con tu número de pedido y motivo.' },
            { step: '02', icon: 'Package', title: 'Preparación', desc: 'Te enviaremos las instrucciones y etiqueta de devolución. Empaqueta los productos en su embalaje original, sin usar y precintados.' },
            { step: '03', icon: 'RotateCw', title: 'Envío Gratis', desc: 'Para productos defectuosos o errores nuestros, cubrimos el coste de envío. Para cambios de opinión, el coste corre por tu cuenta.' },
            { step: '04', icon: 'ShieldCheck', title: 'Reembolso (5-7 días)', desc: 'Una vez recibido y verificado, procesamos el reembolso en 5-7 días hábiles a tu método de pago original.' }
          ],
          summary: [
            { icon: 'Clock', title: '14 Días', text: 'Para solicitar devolución desde la recepción' },
            { icon: 'Package', title: 'Producto Sin Usar', text: 'Con embalaje original y precintado' },
            { icon: 'CheckCircle', title: 'Reembolso Rápido', text: '5-7 días hábiles tras verificación' }
          ],
          sectionTitle: 'Proceso de Devolución',
          conditionsTitle: 'Condiciones para Devolución',
          conditions: [
            'Producto sin usar, sin abrir y en perfecto estado',
            'Embalaje original intacto con todos los precintos',
            'Ticket o comprobante de compra',
            'Solicitud dentro de los 14 días naturales',
            'Formulario de devolución completado'
          ],
          notAcceptedTitle: 'No Aceptamos Devoluciones de',
          notAccepted: [
            'Productos abiertos o usados',
            'Artículos en oferta o liquidación (salvo defecto)',
            'Tarjetas regalo y cajas de suscripción',
            'Productos sin embalaje original',
            'Devoluciones después de 14 días'
          ],
          contactTitle: '¿Necesitas Ayuda?',
          contactText: 'Nuestro equipo de atención al cliente está disponible para ayudarte con cualquier duda sobre cambios o devoluciones.',
          contactEmail: 'hola@cheotnun.com',
          contactWhatsapp: '+34 600 111 222'
        }
      },
      envios: {
        hero: {
          title: 'Envíos y Pagos',
          subtitle: 'Transparencia, seguridad y cumplimiento en cada paso de tu compra.',
          text: 'Realizamos envíos internacionales cumpliendo con todas las regulaciones de Corea del Sur y de cada país destino, para que tu experiencia sea segura y sin complicaciones.'
        },
        features: [
          { text: 'Envíos seguros a\ntoda América Latina y Europa', icon: 'PlaneTakeoff' },
          { text: 'Pagos protegidos\ny múltiples opciones', icon: 'ShieldCheck' }
        ],
        shipping: {
          title: 'Cómo funciona el envío',
          text: 'Te proporcionamos un número de seguimiento para que puedas rastrear tu pedido en todo momento.',
          tableTitle: 'Envíos internacionales',
          tableSubtitle: 'Realizamos envíos a todos estos países y más.'
        },
        payments: {
          title: 'Pagos seguros',
          subtitle: 'Ofrecemos múltiples opciones de pago para tu comodidad.',
          methods: [
            { name: 'Tarjetas de crédito', desc: 'Aceptamos Visa, Mastercard, American Express y más.' },
            { name: 'PayPal', desc: 'Paga de forma rápida y segura con tu cuenta de PayPal.' },
            { name: 'Transferencia bancaria', desc: 'Disponibles para algunos países. Contáctanos para más información.' }
          ]
        }
      }
    },
    rutinasPage: {
      hero: {
        title: 'Aprenda os passos do skincare coreano',
        subtitle: 'Entenda a funcao de cada etapa e monte a rotina perfeita para sua pele.',
        buttonText: 'EXPLORAR PRODUTOS',
        image: '/images/cheotnun-k-beauty-rutinas-skincare.webp'
      },
      stepsSection: {
        title: 'Conheca cada etapa do skincare',
        subtitle: 'Entenda a funcao de cada passo e descubra os produtos ideais para sua pele.',
        footerText: '* Clique em cada etapa para saber mais detalhes sobre os produtos recomendados.'
      },
      steps: [
        { step: '1', icon: 'Droplet', title: 'Limpeza', subtitle: 'Dobra limpeza', description: 'O primeiro passo para uma pele saudavel. Remove impurezas e prepara a pele para os proximos passos.' },
        { step: '2', icon: 'Sparkles', title: 'Tonico', subtitle: 'Equilibrio', description: 'Restaura o pH da pele e remove residuos remanescentes da limpeza.' },
        { step: '3', icon: 'Droplet', title: 'Essencia', subtitle: 'Hidratacao profunda', description: 'O coracao da rotina coreana. Hidrata e prepara a pele para absorver os proximos produtos.' },
        { step: '4', icon: 'Sparkles', title: 'Serum', subtitle: 'Tratamento focalizado', description: 'Concentrado de ativos para tratar necessidades especificas da sua pele.' },
        { step: '5', icon: 'Droplet', title: 'Hidratante', subtitle: 'Barreira protetora', description: 'Sela a hidratacao e fortalece a barreira cutanea.' },
        { step: '6', icon: 'Sparkles', title: 'Protetor Solar', subtitle: 'Protecao diaria', description: 'Passo obrigatorio durante o dia. Protege contra raios UVA e UVB.' }
      ],
      ingredientsSection: {
        title: 'Ingredientes do K-Beauty',
        subtitle: 'Conheca alguns dos ingredientes mais amados da cosmeticia coreana.'
      },
      ingredients: [
        { img: 'https://images.unsplash.com/photo-1616671243739-5e1608e2cd3d?q=80&w=200', name: 'Centella Asiatica', desc: 'Poderoso calmante e regenerador da pele.' },
        { img: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=200', name: 'Niacinamida', desc: 'Uniformiza o tom e textura da pele.' },
        { img: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=200', name: 'Acido Hialuronico', desc: 'Hidratacao profunda e duradoura.' },
        { img: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=200', name: 'Extrato de Cha Verde', desc: 'Antioxidante que protege contra danos ambientais.' },
        { img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=200', name: 'Snail Mucin', desc: 'Reparacao e hidratacao intensa.' },
        { img: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=200', name: 'Extrato de Aloe Vera', desc: 'Hidrata e acalma a pele sensivel.' },
        { img: 'https://images.unsplash.com/photo-1598138324937-2a5920d3c85e?q=80&w=200', name: 'Vitamina C', desc: 'Ilumina e uniformiza a pele.' },
        { img: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a07?q=80&w=200', name: 'Ceramidas', desc: 'Fortalecem a barreira cutanea.' }
      ],
      routineSection: {
        title: 'Como montar sua rotina?',
        boxTitle: 'Sua rotina pode ser unica.',
        boxDesc: 'Nem todas as pessoas precisam seguir todos os passos todos os dias. Conheca sua pele e adapte a rotina as suas necessidades.'
      },
      routineSteps: [
        { num: '1', icon: 'Droplet', title: 'Limpeza' },
        { num: '2', icon: 'Sparkles', title: 'Tonico' },
        { num: '3', icon: 'Droplet', title: 'Essencia' },
        { num: '4', icon: 'Sparkles', title: 'Serum' },
        { num: '5', icon: 'Droplet', title: 'Hidratante' },
        { num: '6', icon: 'Sparkles', title: 'Protetor Solar', sub: '(Durante o dia)' }
      ],
      tipsSection: {
        title: 'Dicas para aproveitar melhor seus produtos'
      },
      tips: [
        { icon: 'Sun', title: 'Rotina da manha', desc: 'Foque em protecao e hidratacao. Use protetor solar todos os dias.', img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=400' },
        { icon: 'Moon', title: 'Rotina da noite', desc: 'Invista em reparacao e tratamento. Sua pele se regenera enquanto voce dorme.', img: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=400' },
        { icon: 'Sparkles', title: 'Pele oleosa', desc: 'Use gel de limpeza e hidratantes oil-free. Nao pule o hidratante!', img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=400' },
        { icon: 'Droplet', title: 'Pele seca', desc: 'Aposte em ingredientes como acido hialuronico e ceramidas para hidratacao profunda.', img: 'https://images.unsplash.com/photo-1618992196915-6b6c1c7d0fe7?q=80&w=400' }
      ],
      makeupSection: {
        title: 'Universo da Maquiagem Coreana',
        subtitle: 'Explore as categorias mais populares da maquiagem coreana.',
        buttonText: 'VER TODAS AS CATEGORIAS DE MAQUIAGEM'
      },
      makeup: [
        { name: 'Cushion', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' },
        { name: 'Lip Tint', img: 'https://images.unsplash.com/photo-1583241157141-ca2d8deb81ae?q=80&w=200' },
        { name: 'Blush', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' },
        { name: 'Sombra', img: 'https://images.unsplash.com/photo-1583241157141-ca2d8deb81ae?q=80&w=200' },
        { name: 'Mascara', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' },
        { name: 'Batom', img: 'https://images.unsplash.com/photo-1583241157141-ca2d8deb81ae?q=80&w=200' },
        { name: 'Caneta Delineadora', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' },
        { name: 'Poe Solta', img: 'https://images.unsplash.com/photo-1583241157141-ca2d8deb81ae?q=80&w=200' }
      ],
      categoriesSection: {
        title: 'Explore nossas categorias'
      },
      categories: [
        { icon: 'Droplet', name: 'Skincare' },
        { icon: 'Sparkles', name: 'Maquiagem' },
        { icon: 'Sun', name: 'Protetor Solar' },
        { icon: 'Heart', name: 'Cuidados Especiais' },
        { icon: 'ClipboardList', name: 'Kits' },
        { icon: 'Star', name: 'Mais Vendidos' },
        { icon: 'Compass', name: 'Marcas' },
        { icon: 'Smile', name: 'Acessorios' }
      ],
      faqSection: {
        title: 'Perguntas frequentes'
      },
      faq: [
        { q: 'Quantos passos devo seguir na minha rotina?', a: 'O ideal e comecar com o basico: limpeza, hidratacao e protecao solar. Conforme sua pele se adapta, voce pode adicionar mais passos.' },
        { q: 'Posso misturar produtos de marcas diferentes?', a: 'Sim! O importante e escolher produtos que atendam as necessidades da sua pele.' },
        { q: 'Com que frequencia devo esfoliar a pele?', a: 'Recomendamos 1 a 2 vezes por semana para peles normais, e 1 vez a cada 15 dias para peles sensiveis.' },
        { q: 'Preciso usar protetor solar mesmo em dias nublados?', a: 'Sim! Os raios UV penetram as nuvens e causam danos a pele mesmo em dias fechados.' }
      ],
      newsletter: {
        title: 'Receba novidades sobre o universo do K-Beauty',
        subtitle: 'Lancamentos, tendencias e dicas exclusivas diretamente no seu email.',
        buttonText: 'QUERO RECEBER NOVIDADES',
        disclaimer: 'Prometemos nao enviar spam. Voce pode cancelar a qualquer momento.',
        image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=400'
      }
    },
    experienciasPage: {
      hero: {
        title: 'Experiencias Yedam',
        subtitle: 'Mucho mas que productos, una conexion con la cultura coreana.',
        buttonText: 'Conecta con la cultura coreana',
        image: '/images/cheotnun-k-beauty-experiencias-viagens.webp'
      },
      experiences: {
        title: 'Descubre nuestras experiencias'
      },
      experiencesList: [
        { icon: 'FlaskConical', title: 'Beauty Experience', desc: 'Descubre el origen de tus productos favoritos y sumergete en la cultura coreana del cuidado de la piel.', img: 'https://images.unsplash.com/photo-1519098635131-4c8c6f31c9a6?q=80&w=400' },
        { icon: 'Award', title: 'Workshops Exclusivos', desc: 'Aprende tecnicas de belleza coreana con expertos y profesionales certificados.', img: 'https://images.unsplash.com/photo-1558980395-be8a5fcb4251?q=80&w=400' },
        { icon: 'PlaneTakeoff', title: 'Viajes Culturales', desc: 'Explora Corea del Sur a traves de experiencias unicas que conectan belleza, cultura y bienestar.', img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=400' },
        { icon: 'Users', title: 'Eventos Privados', desc: 'Organizamos eventos exclusivos para grupos que deseen una experiencia personalizada.', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=400' },
        { icon: 'Heart', title: 'Retiros de Bienestar', desc: 'Programas inmersivos que combinan skincare, bienestar y conexion con la naturaleza.', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400' }
      ],
      maeum: {
        badge: 'En colaboracion con',
        title: 'MAEUM GLOBAL',
        subtitle: 'Viajes que transforman.',
        desc: 'Maeum Global te lleva a Corea para vivir experiencias unicas de belleza, cultura y bienestar.',
        points: [
          'Rutas exclusivas de K-Beauty',
          'Acompanamiento profesional',
          'Experiencias culturales autenticas',
          'Conexion con marcas locales'
        ],
        buttonText: 'EXPLORAR VIAJES',
        buttonLink: 'https://www.maeumglobal.com.br',
        cards: [
          { title: 'Rutas de Belleza', desc: 'Descubre los secretos del K-Beauty en los lugares mas emblematicos de Corea.', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400', icon: 'MapPin' },
          { title: 'Cultura y Tradicion', desc: 'Sumergete en la cultura coreana a traves de experiencias unicas.', img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=400', icon: 'Award' },
          { title: 'Bienestar Integral', desc: 'Conecta cuerpo y mente con programas disenados para tu bienestar.', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400', icon: 'Camera' }
        ]
      },
      testimonials: {
        title: 'Lo que dicen nuestras viajeras',
        buttonText: 'VER MAS TESTIMONIOS',
        list: [
          { quote: 'Una experiencia que cambio mi forma de ver la belleza. Corea es magico.', name: 'Camila R.', country: 'Mexico', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200' },
          { quote: 'Los workshops de maquillaje coreano fueron increibles. Aprendi muchisimo.', name: 'Sofia M.', country: 'Colombia', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200' },
          { quote: 'Viajar con Maeum Global y Cheotnun fue la mejor decision. Repetire sin dudas.', name: 'Valentina L.', country: 'Argentina', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200' }
        ]
      },
      newsletter: {
        title: 'Se la primera en enterarte',
        subtitle: 'de nuevas experiencias y viajes exclusivos.',
        buttonText: 'SUSCRIBIRME',
        disclaimer: 'Prometemos no enviar spam. Puedes cancelar cuando quieras.'
      }
    },
    terminos: {
      hero: {
        badge: 'Marco Legal',
        title: 'Términos y Condiciones',
        subtitle: 'Conoce las reglas que rigen el uso de nuestra plataforma y la relación con nuestros clientes.'
      },
      intro: {
        p1: 'Bienvenido a Cheotnun K-Beauty. Al acceder y utilizar este sitio web, aceptas cumplir con los siguientes términos y condiciones. Si no estás de acuerdo con alguno de estos términos, te recomendamos no utilizar nuestros servicios.',
        brand: 'Cheotnun K-Beauty',
        p2: 'Estos términos establecen los derechos y obligaciones entre Cheotnun K-Beauty y los usuarios de nuestra tienda online especializada en cosmética coreana.'
      },
      company: {
        name: 'Cheotnun K-Beauty',
        nif: 'B-12345678',
        address: 'Calle Gran Vía 12, Madrid, España',
        email: 'hola@cheotnun.com',
        phone: '+34 600 111 222'
      },
      additional: {
        ageTitle: 'Edad Mínima',
        ageDesc: 'Debes ser mayor de 18 años o contar con autorización legal para realizar compras en nuestra tienda. Al registrarte, confirmas que cumples con este requisito.',
        accountTitle: 'Cuentas de Usuario',
        accountDesc: 'Eres responsable de mantener la confidencialidad de tus credenciales de acceso. Notifícanos inmediatamente sobre cualquier uso no autorizado de tu cuenta.'
      },
      contact: {
        title: 'Consultas Legales',
        desc: 'Para cualquier duda sobre estos términos, puedes contactar a nuestro equipo legal.',
        email: 'legal@cheotnun.com',
        phone: '+34 912 345 678'
      },
      sections: [
        { icon: 'ShoppingBag', title: 'Productos y Precios', content: 'Todos los productos están sujetos a disponibilidad. Nos reservamos el derecho de modificar precios sin previo aviso. Los precios mostrados incluyen impuestos aplicables pero no incluyen gastos de envío.' },
        { icon: 'CreditCard', title: 'Pagos y Facturación', content: 'Aceptamos pagos a través de Stripe, PayPal y transferencia bancaria. El cargo se realizará en el momento de la compra. Emitimos factura electrónica para todos los pedidos.' },
        { icon: 'Truck', title: 'Envíos y Entregas', content: 'Realizamos envíos a toda América Latina y Europa. Los plazos de entrega varían según el destino. No nos responsabilizamos por retrasos aduaneros una vez que el paquete ha salido de Corea del Sur.' },
        { icon: 'RotateCcw', title: 'Devoluciones y Reembolsos', content: 'Aceptamos devoluciones dentro de los 14 días posteriores a la recepción. El producto debe estar sin usar y en su embalaje original. Los gastos de devolución corren por cuenta del cliente salvo productos defectuosos.' },
        { icon: 'ShieldCheck', title: 'Propiedad Intelectual', content: 'Todo el contenido de este sitio web, incluyendo imágenes, textos y logotipos, es propiedad de Cheotnun K-Beauty y está protegido por leyes de propiedad intelectual.' },
        { icon: 'Scale', title: 'Limitación de Responsabilidad', content: 'Cheotnun K-Beauty no se hace responsable por daños indirectos derivados del uso de nuestros productos. Cada producto incluye instrucciones de uso que deben ser seguidas cuidadosamente.' }
      ]
    },
    privacidad: {
      hero: {
        badge: 'Transparencia y Seguridad',
        title: 'Política de Privacidad',
        subtitle: 'Tus datos están seguros con nosotros. Conoce cómo recopilamos, usamos y protegemos tu información personal.'
      },
      intro: {
        p1: 'En Cheotnun K-Beauty nos tomamos muy en serio tu privacidad. Esta política describe cómo recopilamos, utilizamos y protegemos tus datos personales cuando utilizas nuestra tienda online.',
        brand: 'Cheotnun K-Beauty',
        p2: 'Al usar nuestra web, aceptas las prácticas descritas en esta política. Te recomendamos leerla detenidamente.',
        p3: 'Nuestro compromiso es garantizar la confidencialidad y seguridad de tus datos personales de acuerdo con la normativa aplicable.'
      },
      security: {
        title: 'Seguridad de Datos',
        p1: 'Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales contra accesos no autorizados, pérdida o destrucción.',
        p2: 'Aunque usamos las mejores prácticas, ninguna transmisión por Internet es 100% segura. Hacemos todo lo posible para proteger tu información.'
      },
      cookies: {
        title: 'Uso de Cookies',
        p1: 'Usamos cookies propias y de terceros para mejorar tu experiencia de navegación, analizar el tráfico y personalizar contenido.',
        p2: 'Puedes configurar tu navegador para rechazar cookies, aunque esto podría afectar la funcionalidad de algunas partes del sitio.'
      },
      contact: {
        title: '¿Dudas sobre Privacidad?',
        desc: 'Nuestro Delegado de Protección de Datos está disponible para resolver cualquier consulta.',
        email: 'dpo@cheotnun.com',
        address: 'Calle Gran Vía 12, Madrid, España'
      },
      sections: [
        { icon: 'FileText', title: 'Información que Recopilamos', content: 'Recopilamos información que nos proporcionas directamente (nombre, email, dirección) e información de navegación (cookies, páginas visitadas).' },
        { icon: 'ShieldCheck', title: 'Uso de tu Información', content: 'Utilizamos tus datos para procesar pedidos, mejorar nuestros servicios, enviar comunicaciones comerciales (con tu consentimiento) y cumplir obligaciones legales.' },
        { icon: 'Share2', title: 'Compartir Información', content: 'No vendemos tus datos personales. Compartimos información solo con proveedores de servicios esenciales (procesamiento de pagos, logística de envíos) bajo estrictos acuerdos de confidencialidad.' },
        { icon: 'Clock', title: 'Retención de Datos', content: 'Conservamos tus datos mientras mantengas una cuenta activa o durante el tiempo necesario para cumplir con obligaciones legales y fiscales.' },
        { icon: 'UserCheck', title: 'Tus Derechos', content: 'Tienes derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos. Puedes ejercer estos derechos escribiendo a dpo@cheotnun.com.' },
        { icon: 'Globe', title: 'Transferencias Internacionales', content: 'Al ser una tienda con operaciones internacionales, tus datos pueden ser transferidos y almacenados en servidores fuera de tu país de residencia.' }
      ]
    },
    blog: {
      pageTitle: 'Blog Cheotnun K-Beauty',
      pageSubtitle: 'Artículos, guías y secretos del skincare coreano.'
    },
    translations: {
      pt: {
        home: {
          hero: {
            titleLine1: 'Sua beleza.',
            titleLine2: 'Seu ritual.',
            titleLine3: 'Seu momento.',
            subtitle: 'Cosméticos coreanos autênticos selecionados para cada etapa do seu cuidado facial. Fórmulas botânicas que revelam sua luminosidade natural.',
            btnBuyText: 'COMPRAR AGORA',
            btnBuyLink: '/tienda',
            btnRoutineText: 'DESCUBRIR ROTINAS',
            btnRoutineLink: '/rutinas',
            bgImage: '/images/banner.webp'
          },
          highlights: {
            items: [
              { icon: 'ShieldCheck', title: '100% ORIGINAIS', text: 'Direto da Coreia' },
              { icon: 'Truck', title: 'ENVIOS INTERNACIONAIS', text: 'Para toda a América Latina' },
              { icon: 'ShieldAlert', title: 'PASSOS SEGUROS', text: 'Protegemos sua compra' },
              { icon: 'Heart', title: 'ATENDIMENTO PERSONALIZADO', text: 'Estamos para ajudar você' }
            ]
          },
          categories: {
            preTitle: 'CATEGORIAS',
            title: 'Explorar por Categoria',
            subtitle: 'Descubra nossa seleção completa de produtos K-Beauty organizados por categoria para encontrar exatamente o que sua pele precisa.',
            buttonText: 'VER MAIS'
          },
          bestSellers: {
            preTitle: 'MAIS VENDIDOS',
            title: 'Os Favoritos',
            subtitle: 'Os produtos que estão conquistando o coração das nossas clientes.',
            buttonText: 'VER MAIS'
          },
          experiencias: {
            preTitle: 'EXPERIÊNCIAS',
            title: 'Viva o K-Beauty',
            cards: [
              { badge: 'WORKSHOP', title: 'Aprenda Conosco', text: 'Participe de workshops exclusivos sobre skincare coreano.', buttonText: 'SAIBA MAIS', image: 'https://images.unsplash.com/photo-1558980395-be8a5fcb4251?q=80&w=600', badgeColor: 'bg-pink-500' },
              { badge: 'VIAGEM', title: 'Explore a Coreia', text: 'Viaje para Coreia do Sul com experiências únicas de beleza e cultura.', buttonText: 'SAIBA MAIS', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600', badgeColor: 'bg-purple-500' },
              { badge: 'EVENTO', title: 'Eventos Exclusivos', text: 'Eventos privados para grupos que desejam uma experiência personalizada.', buttonText: 'SAIBA MAIS', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600', badgeColor: 'bg-amber-500' }
            ]
          },
          routines: {
            preTitle: 'ROTINAS',
            title: 'Sua Rotina Perfeita',
            subtitle: 'Passos simples para uma pele radiante com produtos coreanos.',
            buttonText: 'VER ROTINAS',
            items: [
              { icon: 'Droplets', name: 'Double Cleansing' },
              { icon: 'Sparkles', name: 'Esfoliação' },
              { icon: 'FlaskConical', name: 'Tônico' },
              { icon: 'Droplet', name: 'Essência' },
              { icon: 'Gem', name: 'Sérum' },
              { icon: 'Snowflake', name: 'Hidratação' }
            ],
            badges: [
              { icon: 'Sun', title: 'Protetor Solar' },
              { icon: 'Moon', title: 'Cuidado Noturno' },
              { icon: 'Heart', title: 'Antienvelhecimento' }
            ]
          },
          instagram: {
            title: 'Siga-nos no Instagram',
            subtitle: 'Compartilhamos dicas, novidades e bastidores do K-Beauty.',
            buttonLink: 'https://www.instagram.com/lacheotnun',
            buttonText: '@lacheotnun',
            images: [
              'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400',
              'https://images.unsplash.com/photo-1570194065650-d99fb4b38b34?q=80&w=400',
              'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=400',
              'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=400'
            ]
          },
          newsletter: {
            preTitle: 'NEWSLETTER',
            title: 'Receba Novidades',
            successMessage: 'CADASTRADO!',
            buttonText: 'QUERO RECEBER'
          }
        },
        header: {
          topBar: 'Frete grátis para compras acima de R\$ 297 para todo o Brasil',
          logoText: 'CHEOTNUN',
          logoSubtext: 'Corean Beauty',
          ctaText: 'COMECE AQUI',
          ctaLink: '/tienda',
          navLinks: [
            { label: 'Início', href: '/' },
            { label: 'Loja', href: '/tienda' },
            { label: 'Marcas', href: '/marcas' },
            { label: 'Rotinas', href: '/rutinas' },
            { label: 'Experiências', href: '/experiencias' },
            { label: 'Blog', href: '/blog' },
            { label: 'Contato', href: '/contacto' },
            { label: 'Ajuda', href: '/ayuda/envios' }
          ]
        },
        footer: {
          logoText: 'CHEOTNUN',
          logoSubtext: 'K-Beauty',
          description: 'Sua loja online de cosméticos coreanos autênticos. Produtos originais direto da Coreia.',
          copyright: '© 2026 Cheotnun K-Beauty. Todos os direitos reservados.',
          columns: [
            { title: 'PRODUTOS', links: [
              { label: 'Todos os Produtos', href: '/tienda' },
              { label: 'Mais Vendidos', href: '/tienda' },
              { label: 'Lançamentos', href: '/tienda' },
              { label: 'Marcas', href: '/marcas' },
              { label: 'Promoções', href: '/tienda' }
            ]},
            { title: 'AJUDA', links: [
              { label: 'Como Comprar', href: '/como-funciona' },
              { label: 'Envíos e Pagamentos', href: '/ayuda/envios' },
              { label: 'Devoluciones', href: '/ayuda/devoluciones' },
              { label: 'Perguntas Frequentes', href: '/como-funciona' },
              { label: 'Contato', href: '/contacto' }
            ]},
            { title: 'LEGAL', links: [
              { label: 'Términos e Condições', href: '/terminos' },
              { label: 'Política de Privacidade', href: '/politica-de-privacidad' },
              { label: 'Política de Cookies', href: '/politica-de-privacidad' }
            ]}
          ]
        },
        marcas: {
          hero: {
            image: '/images/marcas-hero.webp',
            title: 'Nossas Marcas',
            subtitle: 'Trabalhamos com as melhores marcas coreanas para levar até você o que há de mais autêntico e inovador em K-Beauty.'
          },
          features: [
            { icon: 'ShieldCheck', title: '100% Original', text: 'Todos os produtos são adquiridos diretamente de distribuidores oficiais na Coreia.' },
            { icon: 'Truck', title: 'Envio Seguro', text: 'Embalagem especial para garantir que seu produto chegue em perfeitas condições.' },
            { icon: 'Award', title: 'Qualidade Garantida', text: 'Selecionamos apenas marcas com trayectoria comprovada e ingredientes de alta qualidade.' }
          ],
          whyChooseUs: {
            title: 'Por que escolher a Cheotnun?',
            items: [
              { icon: 'MapPin', title: 'Conexão Direta com a Coreia', text: 'Nossa equipe viaja regularmente à Coreia para selecionar pessoalmente cada produto.' },
              { icon: 'ShieldCheck', title: 'Autenticidade Garantida', text: 'Certificados de autenticidade e selos originais em cada produto.' },
              { icon: 'Sparkles', title: 'Curadoria Especializada', text: 'Cada produto é testado e aprovado por nossa equipe de especialistas em skincare.' },
              { icon: 'HeartHandshake', title: 'Atendimento Personalizado', text: 'Suporte dedicado para ajudar você a encontrar a rotina perfeita para sua pele.' }
            ],
            conclusionImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600',
            conclusionTitle: 'Qualidade que você pode confiar',
            conclusionText: 'Mais de 10.000 clientes satisfeitas na América Latina confiam na Cheotnun para cuidar da sua pele com o melhor do K-Beauty.'
          },
          testimonials: {
            title: 'O que dizem nossas clientes',
            list: [
              { text: 'Amei os produtos! Minha pele nunca esteve tão radiante. A entrega foi super rápida.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200', name: 'Ana Silva', country: 'Brasil' },
              { text: 'Produtos originais e embalagem perfeita. Recomendo para todas que querem skincare de verdade.', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200', name: 'Mariana Costa', country: 'Brasil' },
              { text: 'A Cheotnun mudou minha rotina de skincare. Agora entendo porque o K-Beauty é tão famoso.', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200', name: 'Juliana Oliveira', country: 'Brasil' }
            ],
            buttonLink: '/contacto',
            buttonText: 'COMPARTILHE SUA EXPERIÊNCIA'
          },
          trustBadges: [
            { icon: 'ShieldCheck', text: 'Produtos Originais' },
            { icon: 'Truck', text: 'Envio Internacional' },
            { icon: 'CreditCard', text: 'Pagamento Seguro' },
            { icon: 'Headphones', text: 'Suporte Dedicado' }
          ]
        },
        comoFunciona: {
          hero: { image: '/images/como-funciona-hero.webp', title: 'Como Funciona', subtitle: 'Simples, rápido e seguro. Veja como é fácil comprar na Cheotnun.' },
          steps: [
            { number: '01', icon: 'Search', title: 'Explore', text: 'Navegue por nossas categorias e descubra os produtos perfeitos para sua pele.' },
            { number: '02', icon: 'ShoppingCart', title: 'Escolha', text: 'Selecione seus produtos favoritos e adicione ao carrinho.' },
            { number: '03', icon: 'CreditCard', title: 'Pague', text: 'Escolha seu método de pagamento preferido (cartão, PayPal ou transferência).' },
            { number: '04', icon: 'Package', title: 'Receba', text: 'Seu pedido chega na sua casa com toda segurança e rastreamento.' }
          ],
          paymentsInfo: { title: 'Métodos de Pagamento', subtitle: 'Aceitamos diversas formas de pagamento para sua comodidade.' },
          shippingInfo: {
            title: 'Informações de Envio',
            subtitle: 'Envio para toda América Latina com seguro e rastreamento inclusos.',
            items: [
              { title: 'Prazo de Entrega', text: '7 a 15 dias úteis dependendo do destino. Trabalhamos com transportadoras parceiras que atuam em toda a região.' },
              { title: 'Rastreamento', text: 'Fornecemos código de rastreamento para todos os pedidos. Você acompanha cada etapa até receber.' },
              { title: 'Seguro', text: 'Todos os envios incluem seguro contra extravio ou danos. Sua compra está protegida do início ao fim.' }
            ]
          },
          faq: {
            title: 'Perguntas frequentes',
            subtitle: 'Resolvemos suas dúvidas mais comuns.',
            buttonText: 'VER TODAS AS PERGUNTAS',
            items: [
              'Os produtos são originais?',
              'Quanto tempo leva para meu pedido chegar?',
              'Vocês fazem envios para meu país?',
              'Posso trocar ou devolver um produto?',
              'Quais métodos de pagamento aceitam?',
              'Como saber o status do meu pedido?'
            ]
          },
          promises: {
            title: 'Produtos 100% originais',
            subtitle: 'Trabalhamos apenas com marcas coreanas autênticas e autorizadas. Garantimos a qualidade e procedência de cada produto.',
            image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600',
            items: [
              { icon: 'ShieldCheck', title: 'Marcas oficiais' },
              { icon: 'Box', title: 'Compra direta na Coreia do Sul' },
              { icon: 'CheckCircle2', title: 'Produtos certificados' },
              { icon: 'Leaf', title: 'Frescor e qualidade garantidos' }
            ]
          },
          community: {
            title: 'Junte-se à nossa comunidade',
            desc: 'Descubra rotinas, dicas, lançamentos e muito mais no Instagram.',
            buttonText: 'SEGUIR NO INSTAGRAM',
            buttonLink: 'https://instagram.com/cheotnun.kbeauty',
            images: [
              'https://images.unsplash.com/photo-1615397323281-a6cecd55dbf7?q=80&w=300',
              'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=300',
              'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=300',
              'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300'
            ]
          },
          newsletter: {
            title: 'Seja a primeira a saber',
            subtitle: 'Novos lançamentos, ofertas exclusivas e conteúdo especial direto no seu e-mail.',
            placeholder: 'Seu melhor e-mail',
            buttonText: 'QUERO RECEBER',
            disclaimer: 'Prometemos não enviar spam. Compartilhamos apenas o melhor do K-Beauty.'
          }
        },
        contacto: {
          hero: { image: '/images/cheotnun-k-beauty-contato-atendimento.webp', title: 'Fale Conosco', subtitle: 'Estamos aqui para ajudar você com dúvidas, sugestões ou qualquer necessidade.', buttonText: 'RESPOSTA RÁPIDA E PERSONALIZADA', badges: [{ icon: 'Clock', text: 'Atendimento em português' }, { icon: 'Clock', text: 'Resposta em menos de 24h' }, { icon: 'CheckCircle2', text: 'Sua satisfação é nossa prioridade' }] },
          contactMethods: {
            title: 'Formas de contato',
            whatsapp: { label: 'WhatsApp', value: '+55 (11) 99999-9999', time: 'Seg a Sex, 9h às 18h (GMT-3)', desc: 'A forma mais rápida de falar com nossa equipe.', btn: 'FALAR AGORA', link: '#contacto-form' },
            email: { label: 'E-mail', value: 'ola@cheotnun.com', time: 'Resposta em menos de 24h', desc: 'Envie um e-mail e responderemos em breve.', btn: 'ENVIAR E-MAIL', link: 'mailto:ola@cheotnun.com' },
            instagram: { label: 'Instagram', value: '@cheotnun.kbeauty', time: '', desc: 'Envie uma mensagem direta no Instagram.', btn: 'IR PARA O INSTAGRAM', link: 'https://instagram.com/cheotnun.kbeauty' },
            hours: { label: 'Horário de atendimento', value: 'Exceto feriados', time: '', desc: 'Segunda a sexta 9h às 18h (GMT-3)', btn: 'VER HORÁRIOS', link: '#' },
            address: { label: 'Endereço', value: 'São Paulo, SP, Brasil', time: '', desc: 'Escritório administrativo', btn: 'VER NO MAPA', link: '#' }
          },
          form: {
            title: 'Envie uma mensagem',
            nameLabel: 'Nome completo',
            emailLabel: 'E-mail',
            subjectLabel: 'Assunto',
            subjectOptions: ['Selecione um assunto', 'Dúvidas sobre produtos', 'Status do meu pedido', 'Devoluções', 'Outros'],
            messageLabel: 'Sua mensagem',
            submitText: 'ENVIAR MENSAGEM',
            securityNotice: 'Suas informações estão seguras conosco e não serão compartilhadas.',
            successAlert: 'Mensagem enviada com sucesso! Entraremos em contato em breve.'
          },
          faq: {
            title: 'Em que podemos ajudar?',
            subtitle: 'Perguntas frequentes rápidas',
            buttonText: 'VER TODAS AS PERGUNTAS FREQUENTES',
            topics: [
              { icon: 'Info', title: 'Informações sobre produtos', desc: 'Dúvidas sobre ingredientes, benefícios e recomendações.' },
              { icon: 'PackageSearch', title: 'Pedidos e envios', desc: 'Consulte o status do seu pedido, prazos de entrega.' },
              { icon: 'CreditCard', title: 'Pagamentos e faturamento', desc: 'Informações sobre métodos de pagamento, notas fiscais e reembolsos.' },
              { icon: 'RefreshCw', title: 'Devoluções e trocas', desc: 'Dúvidas sobre trocas, devoluções e garantias.' },
              { icon: 'Handshake', title: 'Colaborações e imprensa', desc: 'Propostas de colaboração, eventos e imprensa.' }
            ],
            quickItems: [
              'Quanto tempo leva para meu pedido chegar?',
              'Quais métodos de pagamento vocês aceitam?',
              'Vocês fazem envios para todo o Brasil?',
              'Posso trocar ou devolver um produto?'
            ]
          },
          community: {
            title: 'Junte-se à nossa comunidade',
            desc: 'Siga-nos nas redes sociais e seja a primeira a descobrir lançamentos, promoções e dicas de beleza.',
            buttonText: 'SEGUIR NO INSTAGRAM',
            buttonLink: 'https://instagram.com/cheotnun.kbeauty',
            images: [
              'https://images.unsplash.com/photo-1615397323281-a6cecd55dbf7?q=80&w=300',
              'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=300',
              'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=300',
              'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300'
            ]
          }
        },
        envios: {
          hero: { image: '/images/envios-hero.webp', title: 'Envíos e Pagamentos', subtitle: 'Toda a informação sobre prazos, custos e métodos de pagamento.', text: 'Na Cheotnun queremos que sua experiência de compra seja tranquila e segura.' },
          features: [
            { text: 'Envio para toda América Latina e Europa', icon: 'Globe' },
            { text: 'Pagamento 100% seguro com criptografia SSL', icon: 'ShieldCheck' }
          ],
          shipping: {
            title: 'Como funciona o envio',
            text: 'Trabalhamos com parceiros logísticos internacionais para garantir que seu pedido chegue rápido e com segurança.',
            tableTitle: 'Prazos e Custos de Envio',
            tableSubtitle: 'Valores e prazos estimados por região.'
          },
          payments: {
            title: 'Métodos de Pagamento',
            subtitle: 'Aceitamos diversas formas de pagamento para sua comodidade.',
            methods: [
              { name: 'Cartão de Crédito', desc: 'Visa, Mastercard, American Express e Diners Club. Parcelamento em até 6x.' },
              { name: 'PayPal', desc: 'Pague com sua conta PayPal de forma rápida e segura.' },
              { name: 'Transferência Bancária', desc: 'Transferência direta para nossa conta. Consulte os dados após finalizar a compra.' },
              { name: 'Pix', desc: 'Pagamento instantâneo para clientes no Brasil.' }
            ]
          }
        },
        ayudaDevoluciones: {
          hero: {
            badge: 'Política de Devolução',
            title: 'Devoluciones e Reembolsos',
            subtitle: 'Na Cheotnun sua satisfação é nossa prioridade. Se por algum motivo você não ficar satisfeita, estamos aqui para ajudar.',
            steps: [
              { icon: 'Mail', number: '1', title: 'Solicite', desc: 'Envie um e-mail para devoluciones@cheotnun.com com seu número de pedido e motivo da devolução.' },
              { icon: 'ClipboardCheck', number: '2', title: 'Aprovamos', desc: 'Nossa equipe analisará sua solicitação em até 48 horas úteis.' },
              { icon: 'Package', number: '3', title: 'Envie', desc: 'Após aprovação, enviaremos as instruções para devolução do produto.' },
              { icon: 'RefreshCw', number: '4', title: 'Reembolsamos', desc: 'Assim que recebermos e verificarmos o produto, processaremos o reembolso.' }
            ],
            sectionTitle: 'Processo de Devolução',
            summary: [
              { title: 'Prazo', text: 'Até 14 dias após o recebimento do pedido.' },
              { title: 'Condição', text: 'Produto sem uso, na embalagem original e com todos os lacres.' },
              { title: 'Custo', text: 'Gratuito para produtos com defeito. O cliente arca com o frete nos demais casos.' }
            ],
            conditionsTitle: 'Condições para Devolução',
            conditions: [
              'O produto deve estar sem uso e na embalagem original.',
              'Todos os lacres e selos de garantia devem estar intactos.',
              'A solicitação deve ser feita em até 14 dias corridos após o recebimento.',
              'Produtos em promoção ou em kit podem ter condições especiais de devolução.',
              'O reembolso será processado no mesmo método de pagamento utilizado na compra.'
            ],
            notAcceptedTitle: 'Não Aceitamos Devolução de:',
            notAccepted: [
              'Produtos com sinais de uso ou violação do lacre de segurança.',
              'Produtos em promoção ou liquidação com aviso de não aceitação de devolução.',
              'Amostras grátis ou brindes promocionais.',
              'Pedidos com mais de 30 dias após o recebimento.',
              'Produtos que foram danificados por mau uso ou armazenamento inadequado.'
            ],
            contactTitle: 'Contato para Devoluções',
            contactText: 'Tem alguma dúvida sobre o processo de devolução? Estamos aqui para ajudar.',
            contactEmail: 'devoluciones@cheotnun.com',
            contactWhatsapp: '+55 (11) 98888-7777'
          }
        },
        rutinasPage: {
          hero: { image: '/images/rutinas-hero.webp', badge: 'ROTINAS K-BEAUTY', title: 'Sua Rotina de Skincare', subtitle: 'Descubra a rotina coreana passo a passo e transforme sua pele.', buttonText: 'COMECE SUA ROTINA' },
          stepsSection: { title: 'Os Passos do K-Beauty', subtitle: 'A rotina coreana de skincare pode ter de 5 a 12 passos. Aqui estão os essenciais.', footerText: '✨ Cada pele é única. Adapte os passos conforme sua necessidade.' },
          steps: [
            { icon: 'Droplets', title: 'Double Cleansing', desc: 'O primeiro passo é a limpeza dupla: primeiro um óleo removedor de maquiagem, depois um cleanser à base de água.' },
            { icon: 'Sparkles', title: 'Esfoliação', desc: 'Remove células mortas e renova a pele. Recomendamos 1-2 vezes por semana.' },
            { icon: 'FlaskConical', title: 'Tônico', desc: 'Equilibra o pH da pele e prepara para receber os próximos passos.' },
            { icon: 'Droplet', title: 'Essência', desc: 'Um passo exclusivamente coreano, mais leve que um sérum, que hidrata e prepara a pele.' },
            { icon: 'Gem', title: 'Sérum', desc: 'Concentrado de ativos para tratar necessidades específicas: vitamina C, ácido hialurônico, retinol.' },
            { icon: 'Snowflake', title: 'Hidratação', desc: 'Creme hidratante que sela todos os passos anteriores e mantém a pele macia.' }
          ],
          ingredientsSection: { title: 'Ingredientes Coreanos', subtitle: 'Conheça os ingredientes estrela da cosmética coreana.' },
          ingredients: [
            { img: 'https://images.unsplash.com/photo-1615391978149-9fce07b0d447?q=80&w=200', name: 'Snail Mucin', desc: 'Hidrata, regenera e repara a pele. O ingrediente favorito do K-Beauty.' },
            { img: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=200', name: 'Centella Asiatica', desc: 'Acalma, cicatriza e reduz inflamações. Perfeita para peles sensíveis.' },
            { img: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=200', name: 'Ácido Hialurônico', desc: 'Hidratação profunda que retém a umidade na pele.' },
            { img: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=200', name: 'Niacinamida', desc: 'Clareia manchas, controla oleosidade e fortalece a barreira da pele.' },
            { img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=200', name: 'Própolis', desc: 'Antibacteriano natural, hidrata e dá luminosidade.' },
            { img: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b34?q=80&w=200', name: 'Vitamina C', desc: 'Poderoso antioxidante que ilumina e uniformiza o tom da pele.' },
            { img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200', name: 'Ceramidas', desc: 'Restauram a barreira de proteção da pele, evitando a perda de umidade.' },
            { img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=200', name: 'Retinol', desc: 'Antienvelhecimento potente que estimula colágeno e renova as células.' }
          ],
          routineSection: { title: 'Ordem da Rotina', boxTitle: 'Sua rotina pode ser única.', boxDesc: 'Comece com o básico e adicione passos conforme sua pele se acostuma. O segredo é a consistência nos cuidados diários.' },
          routineSteps: [
            { num: '1', title: 'Limpeza', icon: 'Droplets', sub: 'Óleo + Water Cleanser' },
            { num: '2', title: 'Esfoliação', icon: 'Sparkles', sub: '1-2x/semana' },
            { num: '3', title: 'Tônico + Essência', icon: 'FlaskConical', sub: 'Equilibrar + Preparar' },
            { num: '4', title: 'Sérum + Ampola', icon: 'Gem', sub: 'Tratamento específico' },
            { num: '5', title: 'Hidratação', icon: 'Snowflake', sub: 'Creme + Óleo' },
            { num: '6', title: 'Proteção', icon: 'Sun', sub: 'Protetor Solar (manhã)' }
          ],
          tipsSection: { title: 'Dicas Essenciais' },
          tips: [
            { title: 'Conheça seu Tipo de Pele', desc: 'Antes de começar qualquer rotina, identifique se sua pele é oleosa, seca, mista ou sensível.', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400', icon: 'Search' },
            { title: 'Introduza um Passo de Cada Vez', desc: 'Comece com limpeza, hidratação e protetor solar. Depois adicione sérum, esfoliação e tratamentos.', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400', icon: 'ArrowRight' },
            { title: 'Seja Consistente', desc: 'Resultados reais vêm com o uso diário. Dê à sua pele tempo para se adaptar aos novos produtos.', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400', icon: 'Clock' },
            { title: 'Protetor Solar é Inegociável', desc: 'Use todos os dias, mesmo em casa. A proteção solar previne envelhecimento precoce e manchas.', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400', icon: 'Sun' }
          ],
          makeupSection: { title: 'Universo Maquiagem', subtitle: 'A maquiagem coreana é conhecida por sua leveza e acabamento natural.', buttonText: 'SAIBA MAIS' },
          makeup: [
            { name: 'Base Leve', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' },
            { name: 'Corretivo', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' },
            { name: 'Blush', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' },
            { name: 'Batom', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' },
            { name: 'Sombra', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' },
            { name: 'Delineador', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' },
            { name: 'Máscara de Cílios', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' },
            { name: 'Pó Translúcido', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' }
          ],
          categoriesSection: { title: 'Categorias' },
          categories: [
            { icon: 'Droplets', name: 'Limpeza' },
            { icon: 'Sparkles', name: 'Esfoliação' },
            { icon: 'FlaskConical', name: 'Tônico' },
            { icon: 'Droplet', name: 'Essência' },
            { icon: 'Gem', name: 'Sérum' },
            { icon: 'Snowflake', name: 'Hidratação' },
            { icon: 'Sun', name: 'Protetor Solar' },
            { icon: 'Moon', name: 'Cuidado Noturno' }
          ],
          faqSection: { title: 'Perguntas Frequentes' },
          faq: [
            { q: 'Quantos passos uma rotina coreana tem?', a: 'A rotina tradicional coreana tem entre 5 e 12 passos. Recomendamos começar com o essencial e adicionar conforme sua pele se adapta.' },
            { q: 'Posso misturar produtos de marcas diferentes?', a: 'Sim! O importante é escolher produtos adequados ao seu tipo de pele e necessidades, independente da marca.' },
            { q: 'Qual a diferença entre essência e sérum?', a: 'A essência é mais líquida e hidrata superficialmente. O sérum é mais concentrado e trata problemas específicos.' },
            { q: 'Com que idade devo começar a usar antienvelhecimento?', a: 'A prevenção pode começar aos 20-25 anos com antioxidantes como vitamina C. Retinol e ativos mais potentes geralmente a partir dos 30.' }
          ],
          newsletter: { title: 'Receba dicas exclusivas', subtitle: 'e fique por dentro das novidades do universo K-Beauty.', buttonText: 'QUERO RECEBER', disclaimer: 'Prometemos não enviar spam. Você pode cancelar a qualquer momento.', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=400' }
        },
        experienciasPage: {
          hero: { title: 'Experiências Cheotnun', subtitle: 'Muito mais que produtos, uma conexão com a cultura coreana.', buttonText: 'Conecte-se com a cultura coreana', image: '/images/cheotnun-k-beauty-experiencias-viagens.webp' },
          experiences: { title: 'Descubra nossas experiências' },
          experiencesList: [
            { icon: 'FlaskConical', title: 'Beauty Experience', desc: 'Descubra a origem dos seus produtos favoritos e mergulhe na cultura coreana do cuidado da pele.', img: 'https://images.unsplash.com/photo-1519098635131-4c8c6f31c9a6?q=80&w=400' },
            { icon: 'Award', title: 'Workshops Exclusivos', desc: 'Aprenda técnicas de beleza coreana com especialistas e profissionais certificados.', img: 'https://images.unsplash.com/photo-1558980395-be8a5fcb4251?q=80&w=400' },
            { icon: 'PlaneTakeoff', title: 'Viagens Culturais', desc: 'Explore a Coreia do Sul através de experiências únicas que conectam beleza, cultura e bem-estar.', img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=400' },
            { icon: 'Users', title: 'Eventos Privados', desc: 'Organizamos eventos exclusivos para grupos que desejam uma experiência personalizada.', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=400' },
            { icon: 'Heart', title: 'Retiros de Bem-Estar', desc: 'Programas imersivos que combinam skincare, bem-estar e conexão com a natureza.', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400' }
          ],
          maeum: {
            badge: 'Em parceria com',
            title: 'MAEUM GLOBAL',
            subtitle: 'Viagens que transformam.',
            desc: 'Maeum Global leva você à Coreia para viver experiências únicas de beleza, cultura e bem-estar.',
            points: [
              'Roteiros personalizados de K-Beauty',
              'Acompanhamento de especialistas locais',
              'Visitas a fábricas e boutiques exclusivas',
              'Aulas de maquiagem e skincare coreano'
            ],
            buttonLink: 'https://www.maeumglobal.com.br',
            buttonText: 'SAIBA MAIS',
            cards: [
              { title: 'Imersão Cultural', desc: 'Conheça a Coreia além do skincare: história, gastronomia e muito mais.', img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=400', icon: 'Compass' },
              { title: 'Beauty Tour', desc: 'Visite as principais lojas e clínicas de beleza em Seoul e Busan.', img: 'https://images.unsplash.com/photo-1519098635131-4c8c6f31c9a6?q=80&w=400', icon: 'Sparkles' },
              { title: 'Aprendizado', desc: 'Workshops práticos com maquiadores e dermatologistas coreanos.', img: 'https://images.unsplash.com/photo-1558980395-be8a5fcb4251?q=80&w=400', icon: 'BookOpen' }
            ]
          },
          testimonials: {
            title: 'Depoimentos',
            buttonText: 'COMPARTILHE SUA EXPERIÊNCIA',
            list: [
              { quote: 'Uma experiência que mudou minha forma de ver a beleza. Coreia é mágico.', name: 'Camila R.', country: 'Brasil', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200' },
              { quote: 'Os workshops de maquiagem coreana foram incríveis. Aprendi muito.', name: 'Sofia M.', country: 'Brasil', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200' },
              { quote: 'Viajar com Maeum Global e Cheotnun foi a melhor decisão. Repetirei sem dúvidas.', name: 'Valentina L.', country: 'Brasil', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200' }
            ]
          },
          newsletter: {
            title: 'Seja a primeira a saber',
            subtitle: 'de novas experiências e viagens exclusivas.',
            buttonText: 'INSCREVER-ME',
            disclaimer: 'Prometemos não enviar spam. Você pode cancelar quando quiser.'
          }
        },
        terminos: {
          hero: { badge: 'Marco Legal', title: 'Termos e Condições', subtitle: 'Conheça as regras que regem o uso da nossa plataforma e a relação com nossos clientes.' },
          intro: { p1: 'Bem-vindo à Cheotnun K-Beauty. Ao acessar e utilizar este site, você aceita cumprir os seguintes termos e condições. Se não concordar com algum destes termos, recomendamos não utilizar nossos serviços.', brand: 'Cheotnun K-Beauty', p2: 'Estes termos estabelecem os direitos e obrigações entre Cheotnun K-Beauty e os usuários de nossa loja online especializada em cosméticos coreanos.' },
          company: { name: 'Cheotnun K-Beauty', nif: 'B-12345678', address: 'São Paulo, SP, Brasil', email: 'ola@cheotnun.com', phone: '+55 (11) 99999-9999' },
          additional: { ageTitle: 'Idade Mínima', ageDesc: 'Você deve ser maior de 18 anos ou ter autorização legal para realizar compras em nossa loja. Ao se registrar, confirma que cumpre este requisito.', accountTitle: 'Contas de Usuário', accountDesc: 'Você é responsável por manter a confidencialidade de suas credenciais de acesso. Notifique-nos imediatamente sobre qualquer uso não autorizado de sua conta.' },
          contact: { title: 'Consultas Legais', desc: 'Para qualquer dúvida sobre estes termos, entre em contato com nossa equipe jurídica.', email: 'legal@cheotnun.com', phone: '+55 (11) 91234-5678' },
          sections: [
            { icon: 'ShoppingBag', title: 'Produtos e Preços', content: 'Todos os produtos estão sujeitos à disponibilidade. Reservamo-nos o direito de modificar preços sem aviso prévio. Os preços exibidos incluem impostos aplicáveis mas não incluem frete.' },
            { icon: 'CreditCard', title: 'Pagamentos e Faturamento', content: 'Aceitamos pagamentos via cartão de crédito, PayPal e Pix. O pagamento será processado no momento da compra. Emitimos nota fiscal para todos os pedidos.' },
            { icon: 'Truck', title: 'Envios e Entregas', content: 'Realizamos envios para todo o Brasil e América Latina. Os prazos de entrega variam conforme o destino. Não nos responsabilizamos por atrasos alfandegários após o pacote sair da Coreia do Sul.' },
            { icon: 'RotateCcw', title: 'Devoluções e Reembolsos', content: 'Aceitamos devoluções dentro de 14 dias após o recebimento. O produto deve estar sem uso e na embalagem original. O frete de devolução é por conta do cliente, exceto para produtos com defeito.' },
            { icon: 'ShieldCheck', title: 'Propriedade Intelectual', content: 'Todo o conteúdo deste site, incluindo imagens, textos e logotipos, é propriedade da Cheotnun K-Beauty e está protegido por leis de propriedade intelectual.' },
            { icon: 'Scale', title: 'Limitação de Responsabilidade', content: 'A Cheotnun K-Beauty não se responsabiliza por danos indiretos decorrentes do uso de nossos produtos. Cada produto inclui instruções de uso que devem ser seguidas cuidadosamente.' }
          ]
        },
        privacidad: {
          hero: { badge: 'Transparência e Segurança', title: 'Política de Privacidade', subtitle: 'Seus dados estão seguros conosco. Saiba como coletamos, usamos e protegemos suas informações pessoais.' },
          intro: { p1: 'Na Cheotnun K-Beauty levamos sua privacidade muito a sério. Esta política descreve como coletamos, utilizamos e protegemos seus dados pessoais ao utilizar nossa loja online.', brand: 'Cheotnun K-Beauty', p2: 'Ao usar nosso site, você aceita as práticas descritas nesta política. Recomendamos a leitura atenta.', p3: 'Nosso compromisso é garantir a confidencialidade e segurança dos seus dados pessoais de acordo com a legislação aplicável.' },
          security: { title: 'Segurança de Dados', p1: 'Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados pessoais contra acessos não autorizados, perda ou destruição.', p2: 'Embora usemos as melhores práticas, nenhuma transmissão pela Internet é 100% segura. Fazemos todo o possível para proteger suas informações.' },
          cookies: { title: 'Uso de Cookies', p1: 'Utilizamos cookies próprios e de terceiros para melhorar sua experiência de navegação, analisar o tráfego e personalizar conteúdo.', p2: 'Você pode configurar seu navegador para recusar cookies, embora isso possa afetar a funcionalidade de algumas partes do site.' },
          contact: { title: 'Dúvidas sobre Privacidade?', desc: 'Nosso Encarregado de Proteção de Dados está disponível para responder qualquer dúvida.', email: 'dpo@cheotnun.com', address: 'São Paulo, SP, Brasil' },
          sections: [
            { icon: 'FileText', title: 'Informações que Coletamos', content: 'Coletamos informações que você nos fornece diretamente (nome, e-mail, endereço) e informações de navegação (cookies, páginas visitadas).' },
            { icon: 'ShieldCheck', title: 'Uso das suas Informações', content: 'Utilizamos seus dados para processar pedidos, melhorar nossos serviços, enviar comunicações comerciais (com seu consentimento) e cumprir obrigações legais.' },
            { icon: 'Share2', title: 'Compartilhamento de Informações', content: 'Não vendemos seus dados pessoais. Compartilhamos informações apenas com provedores de serviços essenciais (processamento de pagamentos, logística de envios) sob estritos acordos de confidencialidade.' },
            { icon: 'Clock', title: 'Retenção de Dados', content: 'Mantemos seus dados enquanto você tiver uma conta ativa ou pelo tempo necessário para cumprir obrigações legais e fiscais.' },
            { icon: 'UserCheck', title: 'Seus Direitos', content: 'Você tem direito de acessar, retificar, cancelar e se opor ao tratamento de seus dados. Exercite esses direitos escrevendo para dpo@cheotnun.com.' },
            { icon: 'Globe', title: 'Transferências Internacionais', content: 'Por ser uma loja com operações internacionais, seus dados podem ser transferidos e armazenados em servidores fora do seu país de residência.' }
          ]
        },
        blog: {
          pageTitle: 'Blog Cheotnun K-Beauty',
          pageSubtitle: 'Artigos, guias e segredos do skincare coreano.'
        }
      },
      en: {
        home: {
          hero: {
            titleLine1: 'Your beauty.',
            titleLine2: 'Your ritual.',
            titleLine3: 'Your moment.',
            subtitle: 'Authentic Korean cosmetics selected for every stage of your facial care. Botanical formulas that reveal your natural radiance.',
            btnBuyText: 'BUY NOW',
            btnBuyLink: '/tienda',
            btnRoutineText: 'DISCOVER ROUTINES',
            btnRoutineLink: '/rutinas',
            bgImage: '/images/banner.webp'
          },
          highlights: {
            items: [
              { icon: 'ShieldCheck', title: '100% ORIGINAL', text: 'Direct from Korea' },
              { icon: 'Truck', title: 'INTERNATIONAL SHIPPING', text: 'To all Latin America' },
              { icon: 'ShieldAlert', title: 'SAFE PURCHASE', text: 'We protect your order' },
              { icon: 'Heart', title: 'PERSONALIZED CARE', text: 'We are here for you' }
            ]
          },
          categories: {
            preTitle: 'CATEGORIES',
            title: 'Browse by Category',
            subtitle: 'Discover our complete selection of K-Beauty products organized by category to find exactly what your skin needs.',
            buttonText: 'SEE MORE'
          },
          bestSellers: {
            preTitle: 'BEST SELLERS',
            title: 'The Favorites',
            subtitle: 'The products that are winning the hearts of our customers.',
            buttonText: 'SEE MORE'
          },
          experiencias: {
            preTitle: 'EXPERIENCES',
            title: 'Live K-Beauty',
            cards: [
              { badge: 'WORKSHOP', title: 'Learn with Us', text: 'Join exclusive workshops on Korean skincare.', buttonText: 'LEARN MORE', image: 'https://images.unsplash.com/photo-1558980395-be8a5fcb4251?q=80&w=600', badgeColor: 'bg-pink-500' },
              { badge: 'TRAVEL', title: 'Explore Korea', text: 'Travel to South Korea with unique beauty and culture experiences.', buttonText: 'LEARN MORE', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600', badgeColor: 'bg-purple-500' },
              { badge: 'EVENT', title: 'Exclusive Events', text: 'Private events for groups seeking a personalized experience.', buttonText: 'LEARN MORE', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600', badgeColor: 'bg-amber-500' }
            ]
          },
          routines: {
            preTitle: 'ROUTINES',
            title: 'Your Perfect Routine',
            subtitle: 'Simple steps for radiant skin with Korean products.',
            buttonText: 'VIEW ROUTINES',
            items: [
              { icon: 'Droplets', name: 'Double Cleansing' },
              { icon: 'Sparkles', name: 'Exfoliation' },
              { icon: 'FlaskConical', name: 'Toner' },
              { icon: 'Droplet', name: 'Essence' },
              { icon: 'Gem', name: 'Serum' },
              { icon: 'Snowflake', name: 'Moisturizer' }
            ],
            badges: [
              { icon: 'Sun', title: 'Sun Protection' },
              { icon: 'Moon', title: 'Night Care' },
              { icon: 'Heart', title: 'Anti-Aging' }
            ]
          },
          instagram: {
            title: 'Follow us on Instagram',
            subtitle: 'We share tips, news and behind-the-scenes of K-Beauty.',
            buttonLink: 'https://www.instagram.com/lacheotnun',
            buttonText: '@lacheotnun',
            images: [
              'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400',
              'https://images.unsplash.com/photo-1570194065650-d99fb4b38b34?q=80&w=400',
              'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=400',
              'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=400'
            ]
          },
          newsletter: {
            preTitle: 'NEWSLETTER',
            title: 'Get Updates',
            successMessage: 'SUBSCRIBED!',
            buttonText: 'SUBSCRIBE'
          }
        },
        header: {
          topBar: 'Free shipping on orders over \$150 for all Latin America',
          logoText: 'CHEOTNUN',
          logoSubtext: 'Corean Beauty',
          ctaText: 'START HERE',
          ctaLink: '/tienda',
          navLinks: [
            { label: 'Home', href: '/' },
            { label: 'Shop', href: '/tienda' },
            { label: 'Brands', href: '/marcas' },
            { label: 'Routines', href: '/rutinas' },
            { label: 'Experiences', href: '/experiencias' },
            { label: 'Blog', href: '/blog' },
            { label: 'Contact', href: '/contacto' },
            { label: 'Help', href: '/ayuda/envios' }
          ]
        },
        footer: {
          logoText: 'CHEOTNUN',
          logoSubtext: 'K-Beauty',
          description: 'Your online store for authentic Korean cosmetics. Original products direct from Korea.',
          copyright: '© 2026 Cheotnun K-Beauty. All rights reserved.',
          columns: [
            { title: 'PRODUCTS', links: [
              { label: 'All Products', href: '/tienda' },
              { label: 'Best Sellers', href: '/tienda' },
              { label: 'New Arrivals', href: '/tienda' },
              { label: 'Brands', href: '/marcas' },
              { label: 'Sales', href: '/tienda' }
            ]},
            { title: 'HELP', links: [
              { label: 'How to Buy', href: '/como-funciona' },
              { label: 'Shipping & Payments', href: '/ayuda/envios' },
              { label: 'Returns', href: '/ayuda/devoluciones' },
              { label: 'FAQ', href: '/como-funciona' },
              { label: 'Contact', href: '/contacto' }
            ]},
            { title: 'LEGAL', links: [
              { label: 'Terms & Conditions', href: '/terminos' },
              { label: 'Privacy Policy', href: '/politica-de-privacidad' },
              { label: 'Cookie Policy', href: '/politica-de-privacidad' }
            ]}
          ]
        },
        marcas: {
          hero: {
            image: '/images/marcas-hero.webp',
            title: 'Our Brands',
            subtitle: 'We work with the best Korean brands to bring you the most authentic and innovative products in K-Beauty.'
          },
          features: [
            { icon: 'ShieldCheck', title: '100% Original', text: 'All products are sourced directly from official distributors in Korea.' },
            { icon: 'Truck', title: 'Safe Shipping', text: 'Special packaging to ensure your product arrives in perfect condition.' },
            { icon: 'Award', title: 'Quality Guaranteed', text: 'We only select brands with proven track record and high-quality ingredients.' }
          ],
          whyChooseUs: {
            title: 'Why choose Cheotnun?',
            items: [
              { icon: 'MapPin', title: 'Direct Connection to Korea', text: 'Our team travels regularly to Korea to personally select each product.' },
              { icon: 'ShieldCheck', title: 'Authenticity Guaranteed', text: 'Certificates of authenticity and original seals on every product.' },
              { icon: 'Sparkles', title: 'Expert Curation', text: 'Every product is tested and approved by our team of skincare experts.' },
              { icon: 'HeartHandshake', title: 'Personalized Support', text: 'Dedicated support to help you find the perfect routine for your skin.' }
            ],
            conclusionImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600',
            conclusionTitle: 'Quality you can trust',
            conclusionText: 'Over 10,000 satisfied customers across Latin America trust Cheotnun to care for their skin with the best of K-Beauty.'
          },
          testimonials: {
            title: 'What our customers say',
            list: [
              { text: 'I loved the products! My skin has never been so radiant. Delivery was super fast.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200', name: 'Ana Silva', country: 'Brazil' },
              { text: 'Original products and perfect packaging. I recommend to everyone who wants real skincare.', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200', name: 'Mariana Costa', country: 'Brazil' },
              { text: 'Cheotnun changed my skincare routine. Now I understand why K-Beauty is so famous.', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200', name: 'Juliana Oliveira', country: 'Brazil' }
            ],
            buttonLink: '/contacto',
            buttonText: 'SHARE YOUR EXPERIENCE'
          },
          trustBadges: [
            { icon: 'ShieldCheck', text: 'Original Products' },
            { icon: 'Truck', text: 'International Shipping' },
            { icon: 'CreditCard', text: 'Secure Payment' },
            { icon: 'Headphones', text: 'Dedicated Support' }
          ]
        },
        comoFunciona: {
          hero: { image: '/images/como-funciona-hero.webp', title: 'How It Works', subtitle: 'Simple, fast and secure. See how easy it is to buy at Cheotnun.' },
          steps: [
            { number: '01', icon: 'Search', title: 'Explore', text: 'Browse our categories and discover the perfect products for your skin.' },
            { number: '02', icon: 'ShoppingCart', title: 'Choose', text: 'Select your favorite products and add them to cart.' },
            { number: '03', icon: 'CreditCard', title: 'Pay', text: 'Choose your preferred payment method (card, PayPal or bank transfer).' },
            { number: '04', icon: 'Package', title: 'Receive', text: 'Your order arrives safely with tracking included.' }
          ],
          paymentsInfo: { title: 'Payment Methods', subtitle: 'We accept various payment methods for your convenience.' },
          shippingInfo: {
            title: 'Shipping Information',
            subtitle: 'Shipping to all Latin America with insurance and tracking included.',
            items: [
              { title: 'Delivery Time', text: '7 to 15 business days depending on destination. We work with partner carriers throughout the region.' },
              { title: 'Tracking', text: 'We provide tracking codes for all orders. Follow every step until delivery.' },
              { title: 'Insurance', text: 'All shipments include insurance against loss or damage. Your purchase is protected from start to finish.' }
            ]
          },
          faq: {
            title: 'Frequently Asked Questions',
            subtitle: 'We answer your most common questions.',
            buttonText: 'VIEW ALL FAQs',
            items: [
              'Are the products original?',
              'How long does shipping take?',
              'Do you ship to my country?',
              'Can I return or exchange a product?',
              'What payment methods do you accept?',
              'How can I track my order?'
            ]
          },
          promises: {
            title: '100% Original Products',
            subtitle: 'We only work with authentic and authorized Korean brands. We guarantee the quality and origin of every product.',
            image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600',
            items: [
              { icon: 'ShieldCheck', title: 'Official brands' },
              { icon: 'Box', title: 'Direct purchase in South Korea' },
              { icon: 'CheckCircle2', title: 'Certified products' },
              { icon: 'Leaf', title: 'Freshness and quality guaranteed' }
            ]
          },
          community: {
            title: 'Join our community',
            desc: 'Discover routines, tips, launches and more on Instagram.',
            buttonText: 'FOLLOW ON INSTAGRAM',
            buttonLink: 'https://instagram.com/cheotnun.kbeauty',
            images: [
              'https://images.unsplash.com/photo-1615397323281-a6cecd55dbf7?q=80&w=300',
              'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=300',
              'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=300',
              'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300'
            ]
          },
          newsletter: {
            title: 'Be the first to know',
            subtitle: 'New launches, exclusive offers and special content straight to your inbox.',
            placeholder: 'Your email address',
            buttonText: 'SUBSCRIBE',
            disclaimer: 'We promise not to spam. We only share the best of K-Beauty.'
          }
        },
        contacto: {
          hero: { image: '/images/cheotnun-k-beauty-contato-atendimento.webp', title: 'Contact Us', subtitle: 'We are here to help you with questions, suggestions or any need.', buttonText: 'QUICK PERSONALIZED RESPONSE', badges: [{ icon: 'Clock', text: 'English support' }, { icon: 'Clock', text: 'Response in under 24h' }, { icon: 'CheckCircle2', text: 'Your satisfaction is our priority' }] },
          contactMethods: {
            title: 'Contact Methods',
            whatsapp: { label: 'WhatsApp', value: '+1 (555) 123-4567', time: 'Mon to Fri, 9am to 6pm (EST)', desc: 'The fastest way to talk to our team.', btn: 'CHAT NOW', link: '#contacto-form' },
            email: { label: 'Email', value: 'hello@cheotnun.com', time: 'Response in under 24h', desc: 'Send us an email and we will reply shortly.', btn: 'SEND EMAIL', link: 'mailto:hello@cheotnun.com' },
            instagram: { label: 'Instagram', value: '@cheotnun.kbeauty', time: '', desc: 'Send us a direct message on Instagram.', btn: 'GO TO INSTAGRAM', link: 'https://instagram.com/cheotnun.kbeauty' },
            hours: { label: 'Business Hours', value: 'Except holidays', time: '', desc: 'Monday to Friday 9am to 6pm (EST)', btn: 'VIEW HOURS', link: '#' },
            address: { label: 'Address', value: 'Miami, FL, USA', time: '', desc: 'Administrative office', btn: 'VIEW ON MAP', link: '#' }
          },
          form: {
            title: 'Send us a message',
            nameLabel: 'Full name',
            emailLabel: 'Email',
            subjectLabel: 'Subject',
            subjectOptions: ['Select a subject', 'Product questions', 'Order status', 'Returns', 'Other'],
            messageLabel: 'Your message',
            submitText: 'SEND MESSAGE',
            securityNotice: 'Your information is safe with us and will not be shared.',
            successAlert: 'Message sent successfully! We will contact you shortly.'
          },
          faq: {
            title: 'How can we help?',
            subtitle: 'Quick FAQs',
            buttonText: 'VIEW ALL FAQS',
            topics: [
              { icon: 'Info', title: 'Product Information', desc: 'Questions about ingredients, benefits and recommendations.' },
              { icon: 'PackageSearch', title: 'Orders & Shipping', desc: 'Check your order status, delivery times.' },
              { icon: 'CreditCard', title: 'Payments & Billing', desc: 'Information about payment methods, invoices and refunds.' },
              { icon: 'RefreshCw', title: 'Returns & Exchanges', desc: 'Questions about exchanges, returns and warranties.' },
              { icon: 'Handshake', title: 'Collaborations & Press', desc: 'Collaboration proposals, events and press.' }
            ],
            quickItems: [
              'How long does shipping take?',
              'What payment methods do you accept?',
              'Do you ship to my country?',
              'Can I return or exchange a product?'
            ]
          },
          community: {
            title: 'Join our community',
            desc: 'Follow us on social media and be the first to discover launches, promotions and beauty tips.',
            buttonText: 'FOLLOW ON INSTAGRAM',
            buttonLink: 'https://instagram.com/cheotnun.kbeauty',
            images: [
              'https://images.unsplash.com/photo-1615397323281-a6cecd55dbf7?q=80&w=300',
              'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=300',
              'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=300',
              'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300'
            ]
          }
        },
        envios: {
          hero: { image: '/images/envios-hero.webp', title: 'Shipping & Payments', subtitle: 'All information about shipping times, costs and payment methods.', text: 'At Cheotnun we want your shopping experience to be smooth and secure.' },
          features: [
            { text: 'Shipping to all Latin America and Europe', icon: 'Globe' },
            { text: '100% secure payment with SSL encryption', icon: 'ShieldCheck' }
          ],
          shipping: {
            title: 'How shipping works',
            text: 'We work with international logistics partners to ensure your order arrives fast and safely.',
            tableTitle: 'Shipping Times and Costs',
            tableSubtitle: 'Estimated prices and delivery times by region.'
          },
          payments: {
            title: 'Payment Methods',
            subtitle: 'We accept various payment methods for your convenience.',
            methods: [
              { name: 'Credit Card', desc: 'Visa, Mastercard, American Express and Diners Club. Installments up to 6x.' },
              { name: 'PayPal', desc: 'Pay with your PayPal account quickly and securely.' },
              { name: 'Bank Transfer', desc: 'Direct transfer to our account. Check details after checkout.' },
              { name: 'Wire Transfer', desc: 'International wire transfer available for select countries.' }
            ]
          }
        },
        ayudaDevoluciones: {
          hero: {
            badge: 'Return Policy',
            title: 'Returns & Refunds',
            subtitle: 'At Cheotnun your satisfaction is our priority. If for any reason you are not satisfied, we are here to help.',
            steps: [
              { icon: 'Mail', number: '1', title: 'Request', desc: 'Send an email to returns@cheotnun.com with your order number and reason for return.' },
              { icon: 'ClipboardCheck', number: '2', title: 'Approval', desc: 'Our team will review your request within 48 business hours.' },
              { icon: 'Package', number: '3', title: 'Send', desc: 'After approval, we will send instructions for returning the product.' },
              { icon: 'RefreshCw', number: '4', title: 'Refund', desc: 'Once we receive and verify the product, we will process the refund.' }
            ],
            sectionTitle: 'Return Process',
            summary: [
              { title: 'Deadline', text: 'Up to 14 days after receiving the order.' },
              { title: 'Condition', text: 'Product unused, in original packaging with all seals.' },
              { title: 'Cost', text: 'Free for defective products. Customer pays shipping for other cases.' }
            ],
            conditionsTitle: 'Return Conditions',
            conditions: [
              'The product must be unused and in its original packaging.',
              'All seals and warranty stickers must be intact.',
              'The request must be made within 14 calendar days of receipt.',
              'Sale items or kit products may have special return conditions.',
              'The refund will be processed through the same payment method used for the purchase.'
            ],
            notAcceptedTitle: 'We Do NOT Accept Returns for:',
            notAccepted: [
              'Products showing signs of use or tampered security seals.',
              'Clearance or sale items marked as non-returnable.',
              'Free samples or promotional gifts.',
              'Orders received more than 30 days ago.',
              'Products damaged by misuse or improper storage.'
            ],
            contactTitle: 'Returns Contact',
            contactText: 'Have questions about the return process? We are here to help.',
            contactEmail: 'returns@cheotnun.com',
            contactWhatsapp: '+1 (555) 888-7777'
          }
        },
        rutinasPage: {
          hero: { image: '/images/rutinas-hero.webp', badge: 'K-BEAUTY ROUTINES', title: 'Your Skincare Routine', subtitle: 'Discover the Korean routine step by step and transform your skin.', buttonText: 'START YOUR ROUTINE' },
          stepsSection: { title: 'Steps of K-Beauty', subtitle: 'The Korean skincare routine can have 5 to 12 steps. Here are the essentials.', footerText: '✨ Every skin is unique. Adapt the steps to your needs.' },
          steps: [
            { icon: 'Droplets', title: 'Double Cleansing', desc: 'The first step is double cleansing: first an oil-based makeup remover, then a water-based cleanser.' },
            { icon: 'Sparkles', title: 'Exfoliation', desc: 'Removes dead skin cells and renews the skin. Recommended 1-2 times per week.' },
            { icon: 'FlaskConical', title: 'Toner', desc: 'Balances skin pH and prepares it for the next steps.' },
            { icon: 'Droplet', title: 'Essence', desc: 'An exclusively Korean step, lighter than a serum, that hydrates and prepares the skin.' },
            { icon: 'Gem', title: 'Serum', desc: 'Concentrated active ingredients for specific needs: vitamin C, hyaluronic acid, retinol.' },
            { icon: 'Snowflake', title: 'Moisturizer', desc: 'Moisturizing cream that seals all previous steps and keeps skin soft.' }
          ],
          ingredientsSection: { title: 'Korean Ingredients', subtitle: 'Meet the star ingredients of Korean cosmetics.' },
          ingredients: [
            { img: 'https://images.unsplash.com/photo-1615391978149-9fce07b0d447?q=80&w=200', name: 'Snail Mucin', desc: 'Hydrates, regenerates and repairs the skin. The favorite ingredient of K-Beauty.' },
            { img: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=200', name: 'Centella Asiatica', desc: 'Soothes, heals and reduces inflammation. Perfect for sensitive skin.' },
            { img: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=200', name: 'Hyaluronic Acid', desc: 'Deep hydration that retains moisture in the skin.' },
            { img: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=200', name: 'Niacinamide', desc: 'Brightens dark spots, controls oiliness and strengthens the skin barrier.' },
            { img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=200', name: 'Propolis', desc: 'Natural antibacterial, hydrates and adds radiance.' },
            { img: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b34?q=80&w=200', name: 'Vitamin C', desc: 'Powerful antioxidant that brightens and evens skin tone.' },
            { img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200', name: 'Ceramides', desc: 'Restore the skin\'s protective barrier, preventing moisture loss.' },
            { img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=200', name: 'Retinol', desc: 'Powerful anti-aging ingredient that stimulates collagen and renews cells.' }
          ],
          routineSection: { title: 'Routine Order', boxTitle: 'Your routine can be unique.', boxDesc: 'Start with the basics and add steps as your skin gets used to it. The secret is consistency in daily care.' },
          routineSteps: [
            { num: '1', title: 'Cleanse', icon: 'Droplets', sub: 'Oil + Water Cleanser' },
            { num: '2', title: 'Exfoliate', icon: 'Sparkles', sub: '1-2x/week' },
            { num: '3', title: 'Toner + Essence', icon: 'FlaskConical', sub: 'Balance + Prep' },
            { num: '4', title: 'Serum + Ampoule', icon: 'Gem', sub: 'Specific treatment' },
            { num: '5', title: 'Moisturize', icon: 'Snowflake', sub: 'Cream + Oil' },
            { num: '6', title: 'Protect', icon: 'Sun', sub: 'Sunscreen (morning)' }
          ],
          tipsSection: { title: 'Essential Tips' },
          tips: [
            { title: 'Know Your Skin Type', desc: 'Before starting any routine, identify if your skin is oily, dry, combination or sensitive.', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400', icon: 'Search' },
            { title: 'Introduce One Step at a Time', desc: 'Start with cleansing, moisturizing and sunscreen. Then add serum, exfoliation and treatments.', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400', icon: 'ArrowRight' },
            { title: 'Be Consistent', desc: 'Real results come from daily use. Give your skin time to adapt to new products.', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400', icon: 'Clock' },
            { title: 'Sunscreen is Non-Negotiable', desc: 'Use every day, even at home. Sun protection prevents premature aging and dark spots.', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400', icon: 'Sun' }
          ],
          makeupSection: { title: 'Makeup Universe', subtitle: 'Korean makeup is known for its lightness and natural finish.', buttonText: 'LEARN MORE' },
          makeup: [
            { name: 'Light Foundation', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' },
            { name: 'Concealer', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' },
            { name: 'Blush', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' },
            { name: 'Lipstick', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' },
            { name: 'Eyeshadow', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' },
            { name: 'Eyeliner', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' },
            { name: 'Mascara', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' },
            { name: 'Translucent Powder', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200' }
          ],
          categoriesSection: { title: 'Categories' },
          categories: [
            { icon: 'Droplets', name: 'Cleansing' },
            { icon: 'Sparkles', name: 'Exfoliation' },
            { icon: 'FlaskConical', name: 'Toner' },
            { icon: 'Droplet', name: 'Essence' },
            { icon: 'Gem', name: 'Serum' },
            { icon: 'Snowflake', name: 'Moisturizer' },
            { icon: 'Sun', name: 'Sun Protection' },
            { icon: 'Moon', name: 'Night Care' }
          ],
          faqSection: { title: 'Frequently Asked Questions' },
          faq: [
            { q: 'How many steps does a Korean routine have?', a: 'The traditional Korean routine has between 5 and 12 steps. We recommend starting with the essentials and adding as your skin adapts.' },
            { q: 'Can I mix products from different brands?', a: 'Yes! The important thing is to choose products suitable for your skin type and needs, regardless of the brand.' },
            { q: 'What is the difference between essence and serum?', a: 'Essence is more liquid and provides surface hydration. Serum is more concentrated and treats specific concerns.' },
            { q: 'At what age should I start anti-aging products?', a: 'Prevention can start at 20-25 years with antioxidants like vitamin C. Retinol and stronger actives are typically used from age 30.' }
          ],
          newsletter: { title: 'Get exclusive tips', subtitle: 'and stay updated on K-Beauty news.', buttonText: 'SUBSCRIBE', disclaimer: 'We promise not to spam. You can unsubscribe at any time.', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=400' }
        },
        experienciasPage: {
          hero: { title: 'Cheotnun Experiences', subtitle: 'Much more than products, a connection with Korean culture.', buttonText: 'Connect with Korean culture', image: '/images/cheotnun-k-beauty-experiencias-viagens.webp' },
          experiences: { title: 'Discover our experiences' },
          experiencesList: [
            { icon: 'FlaskConical', title: 'Beauty Experience', desc: 'Discover the origin of your favorite products and immerse yourself in Korean skincare culture.', img: 'https://images.unsplash.com/photo-1519098635131-4c8c6f31c9a6?q=80&w=400' },
            { icon: 'Award', title: 'Exclusive Workshops', desc: 'Learn Korean beauty techniques with experts and certified professionals.', img: 'https://images.unsplash.com/photo-1558980395-be8a5fcb4251?q=80&w=400' },
            { icon: 'PlaneTakeoff', title: 'Cultural Travel', desc: 'Explore South Korea through unique experiences connecting beauty, culture and wellness.', img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=400' },
            { icon: 'Users', title: 'Private Events', desc: 'We organize exclusive events for groups seeking a personalized experience.', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=400' },
            { icon: 'Heart', title: 'Wellness Retreats', desc: 'Immersive programs combining skincare, wellness and connection with nature.', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400' }
          ],
          maeum: {
            badge: 'In partnership with',
            title: 'MAEUM GLOBAL',
            subtitle: 'Travels that transform.',
            desc: 'Maeum Global takes you to Korea to experience unique beauty, culture and wellness experiences.',
            points: [
              'Custom K-Beauty itineraries',
              'Guidance from local experts',
              'Visits to exclusive factories and boutiques',
              'Korean makeup and skincare classes'
            ],
            buttonLink: 'https://www.maeumglobal.com.br',
            buttonText: 'LEARN MORE',
            cards: [
              { title: 'Cultural Immersion', desc: 'Explore Korea beyond skincare: history, gastronomy and more.', img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=400', icon: 'Compass' },
              { title: 'Beauty Tour', desc: 'Visit the main beauty stores and clinics in Seoul and Busan.', img: 'https://images.unsplash.com/photo-1519098635131-4c8c6f31c9a6?q=80&w=400', icon: 'Sparkles' },
              { title: 'Learning', desc: 'Hands-on workshops with Korean makeup artists and dermatologists.', img: 'https://images.unsplash.com/photo-1558980395-be8a5fcb4251?q=80&w=400', icon: 'BookOpen' }
            ]
          },
          testimonials: {
            title: 'Testimonials',
            buttonText: 'SHARE YOUR EXPERIENCE',
            list: [
              { quote: 'An experience that changed how I see beauty. Korea is magical.', name: 'Camila R.', country: 'Brazil', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200' },
              { quote: 'The Korean makeup workshops were incredible. I learned so much.', name: 'Sofia M.', country: 'Colombia', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200' },
              { quote: 'Traveling with Maeum Global and Cheotnun was the best decision. I will definitely repeat it.', name: 'Valentina L.', country: 'Argentina', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200' }
            ]
          },
          newsletter: {
            title: 'Be the first to know',
            subtitle: 'about new experiences and exclusive trips.',
            buttonText: 'SUBSCRIBE',
            disclaimer: 'We promise not to spam. You can unsubscribe anytime.'
          }
        },
        terminos: {
          hero: { badge: 'Legal Framework', title: 'Terms & Conditions', subtitle: 'Learn the rules governing the use of our platform and the relationship with our customers.' },
          intro: { p1: 'Welcome to Cheotnun K-Beauty. By accessing and using this website, you agree to comply with the following terms and conditions. If you do not agree with any of these terms, we recommend that you do not use our services.', brand: 'Cheotnun K-Beauty', p2: 'These terms establish the rights and obligations between Cheotnun K-Beauty and the users of our online store specializing in Korean cosmetics.' },
          company: { name: 'Cheotnun K-Beauty', nif: 'B-12345678', address: 'Miami, FL, USA', email: 'hello@cheotnun.com', phone: '+1 (555) 123-4567' },
          additional: { ageTitle: 'Minimum Age', ageDesc: 'You must be at least 18 years old or have legal authorization to make purchases in our store. By registering, you confirm that you meet this requirement.', accountTitle: 'User Accounts', accountDesc: 'You are responsible for maintaining the confidentiality of your login credentials. Notify us immediately of any unauthorized use of your account.' },
          contact: { title: 'Legal Inquiries', desc: 'For any questions about these terms, please contact our legal team.', email: 'legal@cheotnun.com', phone: '+1 (555) 234-5678' },
          sections: [
            { icon: 'ShoppingBag', title: 'Products & Prices', content: 'All products are subject to availability. We reserve the right to modify prices without prior notice. Displayed prices include applicable taxes but do not include shipping costs.' },
            { icon: 'CreditCard', title: 'Payments & Billing', content: 'We accept payments via credit card, PayPal and bank transfer. The charge will be processed at the time of purchase. We issue an electronic invoice for all orders.' },
            { icon: 'Truck', title: 'Shipping & Delivery', content: 'We ship to all Latin America and Europe. Delivery times vary by destination. We are not responsible for customs delays once the package has left South Korea.' },
            { icon: 'RotateCcw', title: 'Returns & Refunds', content: 'We accept returns within 14 days of receipt. The product must be unused and in its original packaging. Return shipping costs are the responsibility of the customer except for defective products.' },
            { icon: 'ShieldCheck', title: 'Intellectual Property', content: 'All content on this website, including images, text and logos, is the property of Cheotnun K-Beauty and is protected by intellectual property laws.' },
            { icon: 'Scale', title: 'Limitation of Liability', content: 'Cheotnun K-Beauty is not liable for indirect damages arising from the use of our products. Each product includes usage instructions that must be followed carefully.' }
          ]
        },
        privacidad: {
          hero: { badge: 'Transparency & Security', title: 'Privacy Policy', subtitle: 'Your data is safe with us. Learn how we collect, use and protect your personal information.' },
          intro: { p1: 'At Cheotnun K-Beauty we take your privacy very seriously. This policy describes how we collect, use and protect your personal data when using our online store.', brand: 'Cheotnun K-Beauty', p2: 'By using our website, you agree to the practices described in this policy. We recommend reading it carefully.', p3: 'Our commitment is to guarantee the confidentiality and security of your personal data in accordance with applicable regulations.' },
          security: { title: 'Data Security', p1: 'We implement technical and organizational security measures to protect your personal data against unauthorized access, loss or destruction.', p2: 'Although we use best practices, no Internet transmission is 100% secure. We do our best to protect your information.' },
          cookies: { title: 'Cookie Usage', p1: 'We use first and third-party cookies to improve your browsing experience, analyze traffic and personalize content.', p2: 'You can configure your browser to reject cookies, although this may affect the functionality of some parts of the site.' },
          contact: { title: 'Privacy Questions?', desc: 'Our Data Protection Officer is available to answer any questions.', email: 'dpo@cheotnun.com', address: 'Miami, FL, USA' },
          sections: [
            { icon: 'FileText', title: 'Information We Collect', content: 'We collect information you provide directly (name, email, address) and browsing information (cookies, pages visited).' },
            { icon: 'ShieldCheck', title: 'Use of Your Information', content: 'We use your data to process orders, improve our services, send commercial communications (with your consent) and fulfill legal obligations.' },
            { icon: 'Share2', title: 'Sharing Information', content: 'We do not sell your personal data. We share information only with essential service providers (payment processing, shipping logistics) under strict confidentiality agreements.' },
            { icon: 'Clock', title: 'Data Retention', content: 'We keep your data while you have an active account or for as long as necessary to fulfill legal and tax obligations.' },
            { icon: 'UserCheck', title: 'Your Rights', content: 'You have the right to access, rectify, cancel and object to the processing of your data. Exercise these rights by writing to dpo@cheotnun.com.' },
            { icon: 'Globe', title: 'International Transfers', content: 'As a store with international operations, your data may be transferred and stored on servers outside your country of residence.' }
          ]
        },
        blog: {
          pageTitle: 'Cheotnun K-Beauty Blog',
          pageSubtitle: 'Articles, guides and secrets of Korean skincare.'
        }
      }
    },
  },
  system_settings: {
    visual_theme: {
      colors: {
        primary: '#08152F',
        secondary: '#091731',
        accent: '#C9C9C9',
        accentHover: '#C9C9C9',
        text: '#F3F4F6',
        background: '#08152F',
        card: 'rgba(15, 23, 42, 0.65)'
      },
      typography: {
        titleFont: 'Cormorant Garamond',
        bodyFont: 'Inter',
        baseSize: '16px'
      },
      logo_url: '/images/cheotnun-logo.webp',
      favicon_url: '/favicon.ico'
    },
    company_details: {
      name: 'Cheotnun K-Beauty S.L.',
      phone: '+34 912 345 678',
      whatsapp: '+34600000000',
      email: 'sac@cheotnun.com',
      address: 'Calle Gran Vía 12, Madrid, España',
      social: {
        instagram: 'https://instagram.com/cheotnun.kbeauty',
        youtube: 'https://www.youtube.com/@enquantoaconteceoficial/featured'
      }
    },
    seo: {
      titleSuffix: '| Cheotnun K-Beauty',
      metaDescription: 'Cosméticos coreanos de alta performance seleccionados para tu rutina.',
      googleAnalyticsId: ''
    },
    smtp: {
      server: 'smtp.mailgun.org',
      email: 'no-reply@cheotnun.com',
      user: 'no-reply@cheotnun.com'
    },
    
    shipping_zones: [
      { country: 'Brasil', methods: [{ name: 'K-Packet', days: '15-25', price: 15.00 }, { name: 'EMS', days: '7-10', price: 35.00 }] },
      { country: 'México', methods: [{ name: 'K-Packet', days: '15-20', price: 15.00 }] },
      { country: 'Chile', methods: [{ name: 'K-Packet', days: '12-20', price: 18.00 }] },
      { country: 'Colombia', methods: [{ name: 'K-Packet', days: '15-25', price: 18.00 }] },
      { country: 'Argentina', methods: [{ name: 'K-Packet', days: '20-30', price: 20.00 }] },
      { country: 'España', methods: [{ name: 'Correos', days: '5-10', price: 10.00 }] }
    ],
    payments: {
      stripePublicKey: 'pk_live_51M3c...'
    },
    invoice_templates: {
      es: {
        title: 'FACTURA COMERCIAL',
        seller: 'Vendedor',
        buyer: 'Comprador',
        description: 'Descripción',
        quantity: 'Cantidad',
        unitPrice: 'Precio Unitario',
        total: 'Total',
        shipping: 'Envío',
        subtotal: 'Subtotal',
        grandTotal: 'Gran Total'
      },
      en: {
        title: 'COMMERCIAL INVOICE',
        seller: 'Seller',
        buyer: 'Buyer',
        description: 'Description',
        quantity: 'Quantity',
        unitPrice: 'Unit Price',
        total: 'Total',
        shipping: 'Shipping',
        subtotal: 'Subtotal',
        grandTotal: 'Grand Total'
      }
    }
  },
  coupons: [
    { id: '1', code: 'CUPOM10', discount: 10.00, type: 'fixed', status: 'active' },
    { id: '2', code: 'KBEAUTY5', discount: 5.00, type: 'fixed', status: 'active' }
  ],
  blog_posts: [
    { id: '1', title: '5 Secretos del Skincare Coreano para una Piel Radiante', slug: '5-secretos-skincare-coreano', subtitle: 'Descubre los principios fundamentales de la rutina coreana que transformarán tu piel.', content: '<p>El skincare coreano no es solo una moda, es una filosofía de cuidado. Aquí te revelamos los 5 secretos mejor guardados que toda rutina K-Beauty debe incluir para lograr una piel luminosa y saludable.</p><h3>1. Doble Limpieza</h3><p>El primer paso y el más importante. Consiste en usar primero un limpiador a base de aceite para eliminar maquillaje y protector solar, seguido de un limpiador a base de agua para limpiar profundamente los poros.</p><h3>2. Exfoliación Suave</h3><p>Olvídate de los exfoliantes agresivos. En Corea se prefiere la exfoliación química suave con ingredientes como ácido láctico o PHA que renuevan la piel sin dañarla.</p><h3>3. Esencias y Sérums</h3><p>Las esencias son el corazón de la rutina coreana. Aplicadas después del tónico, preparan la piel para absorber mejor los sérums y tratamientos posteriores.</p><h3>4. Hidratación en Capas</h3><p>La clave está en aplicar múltiples capas ligeras de hidratación en lugar de una sola crema pesada. Esto permite que cada producto penetre mejor.</p><h3>5. Protección Solar Diaria</h3><p>El paso más importante. Un buen protector solar coreano no solo protege, sino que también cuida y nutre la piel mientras la defiende de los rayos UV.</p>', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200', author: 'Dr. Park', seo_title: '5 Secretos del Skincare Coreano | K-Beauty Tips', seo_description: 'Descubre los 5 secretos fundamentales del skincare coreano para transformar tu rutina de belleza. Aprende sobre doble limpieza, sérums y más.', created_at: '2026-07-08', status: 'published' },
    { id: '2', title: 'Cómo Aplicar el Dokdo Cleanser de Round Lab', slug: 'como-aplicar-dokdo-cleanser-round-lab', subtitle: 'Guía paso a paso para usar correctamente el limpiador facial más popular de Round Lab.', content: '<p>El Dokdo Cleanser de Round Lab se ha convertido en un producto imprescindible en muchas rutinas coreanas. Te enseñamos cómo aplicarlo correctamente para obtener los mejores resultados.</p><h3>¿Por qué es tan especial?</h3><p>Formulado con agua del mar profundo de la isla Dokdo, este limpiador elimina impurezas mientras mantiene la hidratación natural de la piel gracias a sus ingredientes minerales.</p><h3>Paso a Paso</h3><p><strong>Paso 1:</strong> Humedece tu rostro con agua tibia para abrir los poros.</p><p><strong>Paso 2:</strong> Aplica una pequeña cantidad de producto en la palma de tu mano.</p><p><strong>Paso 3:</strong> Masajea suavemente en círculos durante 30-60 segundos.</p><p><strong>Paso 4:</strong> Enjuaga con agua tibia y seca suavemente con una toalla limpia.</p><h3>Consejos Extra</h3><p>Utilízalo tanto en tu rutina de mañana como de noche. Por la mañana eliminará el exceso de grasa nocturna, y por la noche retirará las impurezas acumuladas durante el día.</p>', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1200', author: 'Kim Min-seo', seo_title: 'Cómo Aplicar Dokdo Cleanser | Guía Round Lab', seo_description: 'Aprende a aplicar correctamente el Dokdo Cleanser de Round Lab. Guía paso a paso con consejos profesionales para maximizar sus beneficios.', created_at: '2026-07-09', status: 'published' }
  ],
  newsletter_subscribers: [],
  subscriptions: []
};

let memoryDb: DbState = { ...DEFAULT_STATE, site_content: JSON.parse(JSON.stringify(DEFAULT_STATE.site_content)), system_settings: JSON.parse(JSON.stringify(DEFAULT_STATE.system_settings)) };

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function persistToLocalStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryDb));
  } catch (e) {
    console.error('Failed to persist DB state:', e);
  }
}

function loadFromLocalStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // Apenas marca versao, nunca destrói dados do usuario
    if (!localStorage.getItem('cheotnun_db_version')) {
      localStorage.setItem('cheotnun_db_version', SEED_VERSION);
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      memoryDb = {
        ...DEFAULT_STATE,
        ...parsed,
        site_content: { ...DEFAULT_STATE.site_content, ...(parsed.site_content || {}) },
        system_settings: { ...DEFAULT_STATE.system_settings, ...(parsed.system_settings || {}) }
      };
      return true;
    }
  } catch (e) {
    console.error('Failed to load DB state:', e);
  }
  return false;
}

function getDefault<K extends keyof DbState>(table: K): DbState[K] {
  return deepClone(DEFAULT_STATE[table]);
}

const SYNC_TABLES: (keyof DbState)[] = ['categories', 'brands', 'products', 'blog_posts', 'routines', 'cms_blocks', 'orders', 'order_tracking', 'communication_logs', 'subscriptions'];
const MERGE_TABLES = new Set(['orders', 'order_tracking', 'communication_logs', 'subscriptions']);

async function serverReload(tables: string[]): Promise<Record<string, any[]>> {
  try {
    const resp = await fetch('/api/supabase-reload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get', tables }),
    });
    if (!resp.ok) return {};
    const json = await resp.json();
    return json.data || {};
  } catch { return {}; }
}

let supabaseReady = false;

// IDs deletados localmente que nao devem ser ressuscitados pelo Supabase
function loadDeletedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

function saveDeletedId(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const ids = loadDeletedIds();
    ids.add(id);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify([...ids]));
  } catch {}
}

function mergeTableData(table: string, incoming: any[]) {
  const local = (memoryDb as any)[table] || [];
  const incomingIds = new Set(incoming.map((r: any) => r.id));
  const deletedIds = loadDeletedIds();
  let changed = false;

  // Remove local records that no longer exist on server (deleted by admin)
  const kept = local.filter((r: any) => incomingIds.has(r.id) || deletedIds.has(r.id));
  if (kept.length !== local.length) changed = true;

  // Build a map of kept records for fast lookup
  const localMap = new Map(kept.map((r: any) => [r.id, r]));

  // Add new records or update existing ones
  for (const record of incoming) {
    if (deletedIds.has(record.id)) continue;
    const localRecord = localMap.get(record.id);
    if (!localRecord) {
      kept.push(record);
      changed = true;
    } else if (new Date((record as any).updated_at || 0) > new Date((localRecord as any).updated_at || 0)) {
      Object.assign(localRecord, record);
      changed = true;
    }
  }

  (memoryDb as any)[table] = kept;
  return changed;
}

async function tryLoadFromSupabase() {
  try {
    const data = await serverReload([...SYNC_TABLES] as string[]);
    let changed = false;
    for (const table of SYNC_TABLES) {
      const rows = data[table];
      if (!rows || rows.length === 0) continue;
      if (MERGE_TABLES.has(table)) {
        if (mergeTableData(table, rows)) changed = true;
      } else {
        (memoryDb as any)[table] = rows;
        changed = true;
      }
    }
    if (changed) persistToLocalStorage();
    await loadSettingsFromSupabase();
  } catch (e) {
    console.warn('Supabase sync unavailable, using localStorage:', e);
  } finally {
    supabaseReady = true; // sempre marca pronto, mesmo se falhar
  }
}

function trySaveToSupabase(table: string, records: any[]) {
  if (!supabaseReady) return;
  fetch('/api/supabase-reload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'upsert', table, records }),
  }).catch(() => {});
}

async function loadSettingsFromSupabase() {
  try {
    const resp = await fetch('/api/supabase-reload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getSettings', keys: ['visual_theme', 'company_details', 'seo', 'site_content'] }),
    });
    if (!resp.ok) return;
    const json = await resp.json();
    if (json.data?.visual_theme) memoryDb.system_settings.visual_theme = json.data.visual_theme;
    if (json.data?.company_details) memoryDb.system_settings.company_details = json.data.company_details;
    if (json.data?.seo) memoryDb.system_settings.seo = json.data.seo;
    if (json.data?.site_content) memoryDb.site_content = json.data.site_content;
  } catch {}
}

function trySaveSettingsToSupabase(key: string, value: any) {
  if (!supabaseReady) return;
  fetch('/api/supabase-reload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'saveSetting', key, value }),
  }).catch(() => {});
}

function setMemoryAndPersist(table: string, data: any) {
  (memoryDb as any)[table] = data;
  persistToLocalStorage();
}

export const db = {
  init: async () => {
    loadFromLocalStorage();
    await tryLoadFromSupabase();
  },

  isSupabaseReady: () => supabaseReady,

  reloadFromSupabase: async (tables?: string[]): Promise<void> => {
    try {
      const targetTables = tables || (SYNC_TABLES as string[]);
      const data = await serverReload(targetTables);
      let changed = false;
      for (const table of targetTables) {
        const rows = data[table];
        if (!rows || rows.length === 0) continue;
        if (MERGE_TABLES.has(table)) {
          if (mergeTableData(table, rows)) changed = true;
        } else {
          (memoryDb as any)[table] = rows;
          changed = true;
        }
      }
      if (changed) persistToLocalStorage();
    } catch (e) {
      console.warn('reloadFromSupabase error:', e);
    } finally {
      supabaseReady = true;
    }
  },

  get: <K extends keyof DbState>(table: K): DbState[K] => {
    return memoryDb[table];
  },

  save: <K extends keyof DbState>(table: K, records: DbState[K]): void => {
    memoryDb[table] = records;
    persistToLocalStorage();
    if (table === 'site_content') {
      trySaveSettingsToSupabase('site_content', records);
    } else if (table === 'system_settings') {
      const settings = records as any;
      if (settings.visual_theme) trySaveSettingsToSupabase('visual_theme', settings.visual_theme);
      if (settings.company_details) trySaveSettingsToSupabase('company_details', settings.company_details);
      if (settings.seo) trySaveSettingsToSupabase('seo', settings.seo);
      if (settings.invoice_templates) trySaveSettingsToSupabase('invoice_templates', settings.invoice_templates);
    } else {
      trySaveToSupabase(table as string, records as any[]);
    }
  },

  update: <K extends keyof DbState>(table: K, updater: (data: DbState[K]) => DbState[K]): DbState[K] => {
    const updated = updater(memoryDb[table]);
    memoryDb[table] = updated;
    persistToLocalStorage();
    if (table === 'system_settings') {
      const settings = updated as any;
      if (settings.visual_theme) trySaveSettingsToSupabase('visual_theme', settings.visual_theme);
      if (settings.company_details) trySaveSettingsToSupabase('company_details', settings.company_details);
      if (settings.seo) trySaveSettingsToSupabase('seo', settings.seo);
      if (settings.invoice_templates) trySaveSettingsToSupabase('invoice_templates', settings.invoice_templates);
    } else {
      trySaveToSupabase(table as string, updated as any[]);
    }
    return updated;
  },

  reset: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    memoryDb = { ...DEFAULT_STATE, site_content: deepClone(DEFAULT_STATE.site_content), system_settings: deepClone(DEFAULT_STATE.system_settings) };
  },

  markDeleted: (id: string) => saveDeletedId(id),
  getDefault,
  mergeTranslations: (base: any, translation: any) => mergeTranslations(base, translation),
  getTranslatedRecord: (record: any, locale: string) => getTranslatedRecord(record, locale),
};

export function mergeTranslations(base: any, translation: any): any {
  if (!base) return translation || {};
  if (!translation) return base;
  const result = { ...base };
  for (const key in translation) {
    if (translation[key] && typeof translation[key] === 'object' && !Array.isArray(translation[key])) {
      result[key] = mergeTranslations(base[key], translation[key]);
    } else if (Array.isArray(translation[key]) && Array.isArray(base[key])) {
      result[key] = base[key].map((item: any, index: number) => {
        if (translation[key][index]) {
          if (typeof item === 'object' && typeof translation[key][index] === 'object') {
            return mergeTranslations(item, translation[key][index]);
          }
          return translation[key][index];
        }
        return item;
      });
    } else {
      result[key] = translation[key];
    }
  }
  return result;
}

export function getTranslatedRecord(record: any, locale: string): any {
  if (!record) return record;
  const base = { ...record };
  const translation = record.translations?.[locale];
  if (!translation) return base;
  return mergeTranslations(base, translation);
}
