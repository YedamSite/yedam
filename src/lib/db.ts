// Local In-Memory Database Engine for Yedam K-Beauty (Completely client-safe)
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
  system_settings: Record<string, any>;
}

const DEFAULT_STATE: DbState = {
  users: [
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', email: 'admin@yedam.com', name: 'Super Administrador Yedam', role: 'super_admin' },
    { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', email: 'cliente@example.com', name: 'Jaque Customer', role: 'customer' }
  ],
  categories: [
    { id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Cuidado Facial', slug: 'cuidado-facial', description: 'Produtos de limpeza, tônicos, séruns e hidratantes para o rosto.' },
    { id: '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Cuidado Corporal', slug: 'cuidado-corporal', description: 'Hidratação e tratamento para todo o corpo.' },
    { id: '30eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Cuidado Capilar', slug: 'cuidado-capilar', description: 'Shampoos, condicionadores e máscaras capilares.' },
    { id: '40eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', name: 'Maquillaje', slug: 'maquillaje', description: 'Bases, corretivos, batons e maquiagens premium.' },
    { id: '50eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', name: 'Cuidado de Uñas', slug: 'cuidado-de-unas', description: 'Esmaltes e fortalecedores de unhas.' },
    { id: '60eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', name: 'Protección Solar', slug: 'proteccion-solar', description: 'Protetores solares faciais e corporais de alta tecnologia.' }
  ],
  brands: [
    { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Round Lab', slug: 'round-lab', description: 'Produtos formulados com água do fundo do mar e ingredientes naturais.', is_featured: true },
    { id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', name: 'Beauty of Joseon', slug: 'beauty-of-joseon', description: 'Cosméticos inspirados na medicina tradicional coreana (Hanbang).', is_featured: true },
    { id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', name: 'COSRX', slug: 'cosrx', description: 'Produtos focados em alta performance e ingredientes ativos como Centella e Baba de Caracol.', is_featured: true },
    { id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', name: 'Anua', slug: 'anua', description: 'Fórmula limpa e minimalista para acalmar a barreira da pele.', is_featured: true },
    { id: '70eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', name: 'Skin1004', slug: 'skin1004', description: 'Produtos baseados em extrato puro de Centella Asiática de Madagascar.', is_featured: true }
  ],
  products: [
    { id: '11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11', sku: 'RL-DK-1025', name: '1025 Dokdo Cleanser', slug: '1025-dokdo-cleanser', description: 'Limpiador facial suave que elimina impurezas y mantiene la hidratación.', description_en: 'Gentle facial cleanser that removes impurities and maintains hydration.', price: 18.00, price_promo: 16.20, weight: 0.15, volume: '150ml', stock: 120, hs_code: '3304.99.90', status: 'active', brand_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', category_id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    { id: '22ebc999-9c0b-4ef8-bb6d-6bb9bd380a22', sku: 'BJ-GD-0030', name: 'Glow Deep Serum: Rice + Alpha-Arbutin', slug: 'glow-deep-serum-rice-alpha-arbutin', description: 'Sérum iluminador diseñado para combatir la pigmentación y unificar el tono.', description_en: 'Brightening serum designed to fight pigmentation and unify tone.', price: 22.90, price_promo: 19.90, weight: 0.08, volume: '30ml', stock: 85, hs_code: '3304.99.90', status: 'active', brand_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', category_id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    { id: '33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33', sku: 'CX-AM-0100', name: 'Advanced Snail 96 Mucin Power Essence', slug: 'advanced-snail-96-mucin-power-essence', description: 'Esencia nutritiva de baba de caracol para reparar la barrera cutánea.', description_en: 'Nutritive snail mucin essence to repair the skin barrier.', price: 19.00, price_promo: 18.00, weight: 0.18, volume: '100ml', stock: 150, hs_code: '3304.99.90', status: 'active', brand_id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', category_id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    { id: '44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44', sku: 'AN-HT-0250', name: 'Heartleaf 77% Soothing Toner', slug: 'heartleaf-77-soothing-toner', description: 'Tónico calmante ideal para pieles sensibles y con tendencia al acné.', description_en: 'Soothing toner ideal for sensitive and acne-prone skin.', price: 21.00, price_promo: 19.50, weight: 0.30, volume: '250ml', stock: 90, hs_code: '3304.99.90', status: 'active', brand_id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', category_id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    { id: '55ebc999-9c0b-4ef8-bb6d-6bb9bd380a55', sku: 'SK-MC-0055', name: 'Madagascar Centella Ampoule', slug: 'madagascar-centella-ampoule', description: 'Ampolla calmante 100% de Centella Asiática para reparar e hidratar.', description_en: 'Soothing 100% Centella Asiatica ampoule to repair and hydrate.', price: 23.00, price_promo: 21.00, weight: 0.12, volume: '55ml', stock: 200, hs_code: '3304.99.90', status: 'active', brand_id: '70eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', category_id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }
  ],
  product_images: [
    { id: 'img-1', product_id: '11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11', url: '/products/dokdo-cleanser.jpg', is_main: true, sort_order: 0 },
    { id: 'img-2', product_id: '22ebc999-9c0b-4ef8-bb6d-6bb9bd380a22', url: '/products/glow-deep-serum.jpg', is_main: true, sort_order: 0 },
    { id: 'img-3', product_id: '33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33', url: '/products/snail-essence.jpg', is_main: true, sort_order: 0 },
    { id: 'img-4', product_id: '44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44', url: '/products/heartleaf-toner.jpg', is_main: true, sort_order: 0 },
    { id: 'img-5', product_id: '55ebc999-9c0b-4ef8-bb6d-6bb9bd380a55', url: '/products/centella-ampoule.jpg', is_main: true, sort_order: 0 }
  ],
  addresses: [
    { id: 'addr-1', user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', address_type: 'shipping', first_name: 'Jaque', last_name: 'Customer', street: 'Gran Via', number: '123', complement: 'Apt 4B', city: 'Madrid', state: 'Madrid', postal_code: '28013', country: 'España', phone: '+34600111222', document_type: 'nif', document_number: '12345678Z' }
  ],
  orders: [],
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
          { icon: 'Award', title: '100% ORIGINALES', text: 'Directo desde Corea' },
          { icon: 'Globe', title: 'ENVÍOS INTERNACIONALES', text: 'A toda América Latina' },
          { icon: 'Shield', title: 'PAGOS SEGUROS', text: 'Protegemos tu compra' },
          { icon: 'Heart', title: 'ATENCIÓN PREMIUM', text: 'Estamos para ayudarte' }
        ]
      },
      sort_order: 1,
      active: true
    }
  ],
  system_settings: {
    visual_theme: {
      colors: {
        primary: '#08152F',
        secondary: '#091731',
        accent: '#CFA573',
        accentHover: '#D7B282',
        text: '#F3F4F6',
        background: '#08152F',
        card: 'rgba(15, 23, 42, 0.65)'
      },
      typography: {
        titleFont: 'Cormorant Garamond',
        bodyFont: 'Inter',
        baseSize: '16px'
      },
      logo_url: '/logo-yedam.png',
      favicon_url: '/favicon.ico'
    },
    company_details: {
      name: 'Yedam K-Beauty S.L.',
      phone: '+34 912 345 678',
      whatsapp: '+34600000000',
      email: 'hola@yedambeauty.com',
      address: 'Calle Gran Vía 12, Madrid, España',
      social: {
        instagram: 'https://instagram.com/yedam.kbeauty',
        youtube: 'https://youtube.com/yedam.kbeauty'
      }
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
  }
};

// Global in-memory storage matching DbState
let memoryDb: DbState = DEFAULT_STATE;

export const db = {
  get: <K extends keyof DbState>(table: K): DbState[K] => {
    return memoryDb[table];
  },
  save: <K extends keyof DbState>(table: K, records: DbState[K]): void => {
    memoryDb[table] = records;
  }
};
