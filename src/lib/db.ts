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
}

const STORAGE_KEY = 'cheotnun_db_state';

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
    { id: '11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11', sku: 'RL-DK-1025', name: '1025 Dokdo Cleanser', slug: '1025-dokdo-cleanser', description: 'Limpiador facial suave que elimina impurezas y mantiene la hidratación.', description_en: 'Gentle facial cleanser that removes impurities and maintains hydration.', price: 18.00, price_promo: 16.20, weight: 0.15, volume: '150ml', stock: 120, hs_code: '3304.99.90', status: 'active', brand_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', category_id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400' },
    { id: '22ebc999-9c0b-4ef8-bb6d-6bb9bd380a22', sku: 'BJ-GD-0030', name: 'Glow Deep Serum: Rice + Alpha-Arbutin', slug: 'glow-deep-serum-rice-alpha-arbutin', description: 'Sérum iluminador diseñado para combatir la pigmentación y unificar el tono.', description_en: 'Brightening serum designed to fight pigmentation and unify tone.', price: 22.90, price_promo: 19.90, weight: 0.08, volume: '30ml', stock: 85, hs_code: '3304.99.90', status: 'active', brand_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', category_id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400' },
    { id: '33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33', sku: 'CX-AM-0100', name: 'Advanced Snail 96 Mucin Power Essence', slug: 'advanced-snail-96-mucin-power-essence', description: 'Esencia nutritiva de baba de caracol para reparar la barrera cutánea.', description_en: 'Nutritive snail mucin essence to repair the skin barrier.', price: 19.00, price_promo: 18.00, weight: 0.18, volume: '100ml', stock: 150, hs_code: '3304.99.90', status: 'active', brand_id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', category_id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400' },
    { id: '44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44', sku: 'AN-HT-0250', name: 'Heartleaf 77% Soothing Toner', slug: 'heartleaf-77-soothing-toner', description: 'Tónico calmante ideal para pieles sensibles y con tendencia al acné.', description_en: 'Soothing toner ideal for sensitive and acne-prone skin.', price: 21.00, price_promo: 19.50, weight: 0.30, volume: '250ml', stock: 90, hs_code: '3304.99.90', status: 'active', brand_id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', category_id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400' },
    { id: '55ebc999-9c0b-4ef8-bb6d-6bb9bd380a55', sku: 'SK-MC-0055', name: 'Madagascar Centella Ampoule', slug: 'madagascar-centella-ampoule', description: 'Ampolla calmante 100% de Centella Asiática para reparar e hidratar.', description_en: 'Soothing 100% Centella Asiatica ampoule to repair and hydrate.', price: 23.00, price_promo: 21.00, weight: 0.12, volume: '55ml', stock: 200, hs_code: '3304.99.90', status: 'active', brand_id: '70eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', category_id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400' }
  ],
  product_images: [],
  addresses: [
    { id: 'addr-1', user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', address_type: 'shipping', first_name: 'Jaque', last_name: 'Customer', street: 'Gran Via', number: '123', complement: 'Apt 4B', city: 'Madrid', state: 'Madrid', postal_code: '28013', country: 'España', phone: '+34600111222', document_type: 'nif', document_number: '12345678Z' }
  ],
  orders: [
    {
      id: 'ord-001', customer_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', status: 'aguardando_confirmacao', items: [{ product_id: '11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11', name: '1025 Dokdo Cleanser', quantity: 2, price: 18.00 }],
      subtotal: 36.00, shipping_amount: 15.00, discount_amount: 0, total_amount: 51.00, gateway: 'stripe', carrier: null, tracking_code: null, commercial_invoice_url: '/invoices/cheotnun-inv-ord-001.pdf',
      shipping_address: { first_name: 'Jaque', last_name: 'Customer', street: 'Gran Via', number: '123', city: 'Madrid', state: 'Madrid', country: 'España' },
      billing_address: { first_name: 'Jaque', last_name: 'Customer', street: 'Gran Via', number: '123', city: 'Madrid', state: 'Madrid', country: 'España' },
      created_at: new Date(Date.now() - 0 * 86400000).toISOString(), updated_at: new Date().toISOString()
    },
    {
      id: 'ord-002', customer_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', status: 'aguardando_confirmacao', items: [{ product_id: '22ebc999-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Glow Deep Serum', quantity: 1, price: 22.90 }],
      subtotal: 22.90, shipping_amount: 15.00, discount_amount: 0, total_amount: 37.90, gateway: 'stripe', carrier: null, tracking_code: null, commercial_invoice_url: '/invoices/cheotnun-inv-ord-002.pdf',
      shipping_address: { first_name: 'Jaque', last_name: 'Customer', street: 'Gran Via', number: '123', city: 'Madrid', state: 'Madrid', country: 'España' },
      billing_address: { first_name: 'Jaque', last_name: 'Customer', street: 'Gran Via', number: '123', city: 'Madrid', state: 'Madrid', country: 'España' },
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(), updated_at: new Date().toISOString()
    },
    {
      id: 'ord-003', customer_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', status: 'aguardando_confirmacao', items: [{ product_id: '33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Advanced Snail 96 Mucin Power Essence', quantity: 1, price: 19.00 }],
      subtotal: 19.00, shipping_amount: 15.00, discount_amount: 0, total_amount: 34.00, gateway: 'paypal', carrier: null, tracking_code: null, commercial_invoice_url: '/invoices/cheotnun-inv-ord-003.pdf',
      shipping_address: { first_name: 'Jaque', last_name: 'Customer', street: 'Gran Via', number: '123', city: 'Madrid', state: 'Madrid', country: 'España' },
      billing_address: { first_name: 'Jaque', last_name: 'Customer', street: 'Gran Via', number: '123', city: 'Madrid', state: 'Madrid', country: 'España' },
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(), updated_at: new Date().toISOString()
    },
    {
      id: 'ord-004', customer_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', status: 'preparando_envio', items: [{ product_id: '44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44', name: 'Heartleaf 77% Soothing Toner', quantity: 2, price: 21.00 }, { product_id: '55ebc999-9c0b-4ef8-bb6d-6bb9bd380a55', name: 'Madagascar Centella Ampoule', quantity: 1, price: 23.00 }],
      subtotal: 65.00, shipping_amount: 15.00, discount_amount: 5.00, total_amount: 75.00, gateway: 'stripe', carrier: 'DHL', tracking_code: 'LX123456789KR', commercial_invoice_url: '/invoices/cheotnun-inv-ord-004.pdf',
      shipping_address: { first_name: 'Maria', last_name: 'Rodriguez', street: 'Avenida Paulista', number: '1000', city: 'São Paulo', state: 'SP', country: 'Brasil' },
      billing_address: { first_name: 'Maria', last_name: 'Rodriguez', street: 'Avenida Paulista', number: '1000', city: 'São Paulo', state: 'SP', country: 'Brasil' },
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(), updated_at: new Date().toISOString()
    },
    {
      id: 'ord-005', customer_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', status: 'enviado', items: [{ product_id: '11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11', name: '1025 Dokdo Cleanser', quantity: 3, price: 18.00 }],
      subtotal: 54.00, shipping_amount: 15.00, discount_amount: 0, total_amount: 69.00, gateway: 'stripe', carrier: 'FedEx', tracking_code: 'FX987654321KR', commercial_invoice_url: '/invoices/cheotnun-inv-ord-005.pdf',
      shipping_address: { first_name: 'Sofia', last_name: 'Fernandez', street: 'Calle Serrano', number: '45', city: 'Madrid', state: 'Madrid', country: 'España' },
      billing_address: { first_name: 'Sofia', last_name: 'Fernandez', street: 'Calle Serrano', number: '45', city: 'Madrid', state: 'Madrid', country: 'España' },
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(), updated_at: new Date().toISOString()
    },
    {
      id: 'ord-006', customer_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', status: 'entregue', items: [{ product_id: '55ebc999-9c0b-4ef8-bb6d-6bb9bd380a55', name: 'Madagascar Centella Ampoule', quantity: 2, price: 23.00 }],
      subtotal: 46.00, shipping_amount: 15.00, discount_amount: 0, total_amount: 61.00, gateway: 'paypal', carrier: 'EMS Korea', tracking_code: 'EM555555555KR', commercial_invoice_url: '/invoices/cheotnun-inv-ord-006.pdf',
      shipping_address: { first_name: 'Ana', last_name: 'Lopez', street: 'Calle Mayor', number: '10', city: 'Barcelona', state: 'Cataluña', country: 'España' },
      billing_address: { first_name: 'Ana', last_name: 'Lopez', street: 'Calle Mayor', number: '10', city: 'Barcelona', state: 'Cataluña', country: 'España' },
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(), updated_at: new Date().toISOString()
    },
    {
      id: 'ord-007', customer_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', status: 'enviado', items: [{ product_id: '33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Advanced Snail 96 Mucin Power Essence', quantity: 1, price: 19.00 }, { product_id: '44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44', name: 'Heartleaf 77% Soothing Toner', quantity: 1, price: 21.00 }],
      subtotal: 40.00, shipping_amount: 15.00, discount_amount: 0, total_amount: 55.00, gateway: 'stripe', carrier: 'DHL Express', tracking_code: 'DH333333333KR', commercial_invoice_url: '/invoices/cheotnun-inv-ord-007.pdf',
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
        youtube: 'https://youtube.com/cheotnun.kbeauty'
      },
      columns: [
        {
          title: 'Tienda',
          links: [
            { label: 'Todos los productos', href: '/tienda' },
            { label: 'Cuidado Facial', href: '/tienda?category=cuidado-facial' },
            { label: 'Protección Solar', href: '/tienda?category=proteccion-solar' },
            { label: 'Rutinas Recomendadas', href: '/rutinas' },
            { label: 'Blog', href: '/blog' }
          ]
        },
        {
          title: 'Ayuda & Políticas',
          links: [
            { label: 'Envíos y Entregas', href: '/ayuda/envios' },
            { label: 'Cambios y Devoluciones', href: '/ayuda/devoluciones' },
            { label: 'Política de Privacidad', href: '/politica-de-privacidad' },
            { label: 'Términos y Condiciones', href: '/terminos' }
          ]
        },
        {
          title: 'Atención al Cliente',
          links: [
            { label: 'WhatsApp: +34 600 111 222', href: 'https://wa.me/34600111222', icon: 'MessageCircle' },
            { label: 'hola@cheotnun.com', href: 'mailto:hola@cheotnun.com', icon: 'Mail' },
            { label: 'Calle Gran Vía 12, Madrid, España', href: '#', icon: 'MapPin' }
          ]
        }
      ]
    }
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
      email: 'hola@cheotnun.com',
      address: 'Calle Gran Vía 12, Madrid, España',
      social: {
        instagram: 'https://instagram.com/cheotnun.kbeauty',
        youtube: 'https://youtube.com/cheotnun.kbeauty'
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
  newsletter_subscribers: []
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

const SYNC_TABLES: (keyof DbState)[] = ['categories', 'brands', 'products', 'blog_posts', 'routines', 'cms_blocks', 'orders', 'order_tracking', 'communication_logs'];

let supabaseReady = false;

async function tryLoadFromSupabase() {
  try {
    const { supabaseDb } = await import('@/lib/supabaseDb');
    const ready = await supabaseDb.init();
    if (!ready) return;
    supabaseReady = true;

    for (const table of SYNC_TABLES) {
      try {
        const data = await supabaseDb.get(table);
        if (data && data.length > 0) {
          (memoryDb as any)[table] = data as any;
        }
      } catch {}
    }

    const themeVal = await supabaseDb.getSettings('visual_theme');
    if (themeVal) {
      memoryDb.system_settings.visual_theme = themeVal;
    }
    const companyVal = await supabaseDb.getSettings('company_details');
    if (companyVal) {
      memoryDb.system_settings.company_details = companyVal;
    }

    persistToLocalStorage();
  } catch (e) {
    console.warn('Supabase sync unavailable, using localStorage:', e);
  }
}

const UPSERT_TABLES = new Set(['orders', 'order_tracking', 'communication_logs']);

function trySaveToSupabase(table: string, records: any[]) {
  if (!supabaseReady) return;
  import('@/lib/supabaseDb').then(({ supabaseDb }) => {
    if (supabaseDb.isConnected()) {
      if (UPSERT_TABLES.has(table)) {
        supabaseDb.upsert(table as any, records);
      } else {
        supabaseDb.save(table as any, records);
      }
    }
  }).catch(() => {});
}

function trySaveSettingsToSupabase(key: string, value: any) {
  if (!supabaseReady) return;
  import('@/lib/supabaseDb').then(({ supabaseDb }) => {
    if (supabaseDb.isConnected()) {
      supabaseDb.saveSettings(key, value);
    }
  }).catch(() => {});
}

export const db = {
  init: () => {
    loadFromLocalStorage();
    tryLoadFromSupabase();
  },

  get: <K extends keyof DbState>(table: K): DbState[K] => {
    return memoryDb[table];
  },

  save: <K extends keyof DbState>(table: K, records: DbState[K]): void => {
    memoryDb[table] = records;
    persistToLocalStorage();
    if (table === 'system_settings') {
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
