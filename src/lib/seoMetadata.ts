import type { Metadata } from 'next';

const baseUrl = 'https://www.cheotnun.com';

export function generateHomeMetadata(locale: string = 'es'): Metadata {
  const titles = {
    es: 'CHEOTNUN K-BEAUTY | Cosméticos Coreanos Premium - Tu Belleza, Tu Ritual',
    pt: 'CHEOTNUN K-BEAUTY | Cosméticos Coreanos Premium - Sua Beleza, Seu Ritual',
    en: 'CHEOTNUN K-BEAUTY | Premium Korean Cosmetics - Your Beauty, Your Ritual',
  };

  const descriptions = {
    es: 'Descubre los mejores cosméticos coreanos para cada etapa de tu cuidado facial. Envíos internacionales a América Latina y España. K-Beauty auténtico con fórmulas botánicas.',
    pt: 'Descubra os melhores cosméticos coreanos para cada etapa do seu cuidado facial. Envios internacionais para América Latina e Espanha. K-Beauty autêntico com fórmulas botânicas.',
    en: 'Discover the best Korean cosmetics for every step of your skincare routine. International shipping to Latin America and Spain. Authentic K-Beauty with botanical formulas.',
  };

  const localeMap = {
    es: 'es_ES',
    pt: 'pt_BR',
    en: 'en_US',
  };

  return {
    title: titles[locale as keyof typeof titles],
    description: descriptions[locale as keyof typeof descriptions],
    keywords: [
      'K-Beauty',
      'Cosméticos Coreanos',
      'Skincare Coreano',
      'Rutina Coreana',
      'Cuidado Facial',
      'Belleza Coreana',
      'Korean Cosmetics',
      'Korean Skincare',
      'Cheotnun',
      locale === 'es' ? 'España' : locale === 'pt' ? 'Brasil' : 'International',
    ].join(', '),
    alternates: {
      canonical: baseUrl,
      languages: {
        es: `${baseUrl}/es`,
        pt: `${baseUrl}/pt`,
        en: `${baseUrl}/en`,
      },
    },
    openGraph: {
      type: 'website',
      locale: localeMap[locale as keyof typeof localeMap],
      alternateLocale: ['es_ES', 'pt_BR', 'en_US'].filter((l) => l !== localeMap[locale as keyof typeof localeMap]),
      url: baseUrl,
      siteName: 'CHEOTNUN K-BEAUTY',
      title: titles[locale as keyof typeof titles],
      description: descriptions[locale as keyof typeof descriptions],
      images: [
        {
          url: '/images/banner.webp',
          width: 1200,
          height: 630,
          alt: 'CHEOTNUN K-BEAUTY - Cosméticos Coreanos Premium',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale as keyof typeof titles],
      description: descriptions[locale as keyof typeof descriptions],
      images: ['/images/banner.webp'],
    },
  };
}

export function generateShopMetadata(locale: string = 'es'): Metadata {
  const titles = {
    es: 'Tienda de Cosméticos Coreanos | K-Beauty Premium - CHEOTNUN',
    pt: 'Loja de Cosméticos Coreanos | K-Beauty Premium - CHEOTNUN',
    en: 'Korean Cosmetics Shop | Premium K-Beauty - CHEOTNUN',
  };

  const descriptions = {
    es: 'Explora nuestra colección de cosméticos coreanos premium. Round Lab, Beauty of Joseon, COSRX, Anua y más. Envíos rápidos y seguros.',
    pt: 'Explore nossa coleção de cosméticos coreanos premium. Round Lab, Beauty of Joseon, COSRX, Anua e mais. Envios rápidos e seguros.',
    en: 'Explore our collection of premium Korean cosmetics. Round Lab, Beauty of Joseon, COSRX, Anua and more. Fast and secure shipping.',
  };

  return {
    title: titles[locale as keyof typeof titles],
    description: descriptions[locale as keyof typeof descriptions],
    openGraph: {
      type: 'website',
      locale: locale === 'es' ? 'es_ES' : locale === 'pt' ? 'pt_BR' : 'en_US',
      url: `${baseUrl}/tienda`,
    },
  };
}

export function generateBlogMetadata(locale: string = 'es'): Metadata {
  const titles = {
    es: 'Blog de Skincare Coreano | Tips y Rutinas K-Beauty - CHEOTNUN',
    pt: 'Blog de Skincare Coreano | Dicas e Rotinas K-Beauty - CHEOTNUN',
    en: 'Korean Skincare Blog | K-Beauty Tips and Routines - CHEOTNUN',
  };

  const descriptions = {
    es: 'Descubre secretos del skincare coreano, rutinas paso a paso, reseñas de productos y tips de expertos en K-Beauty.',
    pt: 'Descubra segredos do skincare coreano, rotinas passo a passo, resenhas de produtos e dicas de especialistas em K-Beauty.',
    en: 'Discover Korean skincare secrets, step-by-step routines, product reviews and K-Beauty expert tips.',
  };

  return {
    title: titles[locale as keyof typeof titles],
    description: descriptions[locale as keyof typeof descriptions],
    openGraph: {
      type: 'website',
      locale: locale === 'es' ? 'es_ES' : locale === 'pt' ? 'pt_BR' : 'en_US',
      url: `${baseUrl}/blog`,
    },
  };
}

export function generateRoutinesMetadata(locale: string = 'es'): Metadata {
  const titles = {
    es: 'Rutinas de Skincare Coreano | Guías Paso a Paso - CHEOTNUN',
    pt: 'Rotinas de Skincare Coreano | Guias Passo a Passo - CHEOTNUN',
    en: 'Korean Skincare Routines | Step-by-Step Guides - CHEOTNUN',
  };

  const descriptions = {
    es: 'Encuentra la rutina perfecta para tu tipo de piel. Guías completas de skincare coreano con productos recomendados.',
    pt: 'Encontre a rotina perfeita para seu tipo de pele. Guias completos de skincare coreano com produtos recomendados.',
    en: 'Find the perfect routine for your skin type. Complete Korean skincare guides with recommended products.',
  };

  return {
    title: titles[locale as keyof typeof titles],
    description: descriptions[locale as keyof typeof descriptions],
    openGraph: {
      type: 'article',
      locale: locale === 'es' ? 'es_ES' : locale === 'pt' ? 'pt_BR' : 'en_US',
      url: `${baseUrl}/rutinas`,
    },
  };
}

export function generateExperienciasMetadata(locale: string = 'es'): Metadata {
  const titles = {
    es: 'Experiencias K-Beauty | Inmersión en Skincare Coreano - CHEOTNUN',
    pt: 'Experiências K-Beauty | Imersão em Skincare Coreano - CHEOTNUN',
    en: 'K-Beauty Experiences | Korean Skincare Immersion - CHEOTNUN',
  };

  const descriptions = {
    es: 'Vive la belleza coreana más allá de los productos. Talleres, eventos y experiencias exclusivas de K-Beauty.',
    pt: 'Viva a beleza coreana além dos produtos. Workshops, eventos e experiências exclusivas de K-Beauty.',
    en: 'Experience Korean beauty beyond products. Workshops, events and exclusive K-Beauty experiences.',
  };

  return {
    title: titles[locale as keyof typeof titles],
    description: descriptions[locale as keyof typeof descriptions],
    openGraph: {
      type: 'website',
      locale: locale === 'es' ? 'es_ES' : locale === 'pt' ? 'pt_BR' : 'en_US',
      url: `${baseUrl}/experiencias`,
    },
  };
}