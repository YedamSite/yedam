import { db } from '@/lib/db';

interface StructuredDataProps {
  locale?: string;
}

export function generateOrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Cheotnun K-Beauty",
    "alternateName": "CHEOTNUN",
    "url": "https://www.cheotnun.com",
    "logo": "https://www.cheotnun.com/images/cheotnun-k-beauty-logo-oficial.webp",
    "description": "Cosméticos coreanos autênticos selecionados para cada etapa do seu cuidado facial e corporal. K-Beauty premium com envios internacionais.",
    "foundingDate": "2024",
    "founders": [
      {
        "@type": "Person",
        "name": "Cheotnun Founder"
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Calle Gran Vía 12",
      "addressLocality": "Madrid",
      "postalCode": "28013",
      "addressCountry": "ES"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+34-600-111-222",
      "contactType": "customer service",
      "availableLanguage": ["Spanish", "Portuguese", "English"],
      "areaServed": ["ES", "BR", "MX", "CL", "CO", "AR", "US"]
    },
    "sameAs": [
      "https://www.instagram.com/cheotnun.kbeauty",
      "https://www.youtube.com/cheotnun.kbeauty",
      "https://www.facebook.com/cheotnun.kbeauty",
      "https://www.tiktok.com/@cheotnun.kbeauty"
    ],
    "areaServed": [
      "https://www.cheotnun.com/es",
      "https://www.cheotnun.com/pt",
      "https://www.cheotnun.com/en"
    ],
    "inLanguage": ["es", "pt", "en"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.cheotnun.com/tienda?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
  return schema;
}

export function generateWebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CHEOTNUN K-BEAUTY",
    "alternateName": "Cheotnun",
    "url": "https://www.cheotnun.com",
    "description": "Tu belleza. Tu ritual. Tu momento. Cosméticos coreanos auténticos para cada etapa de tu cuidado facial.",
    "inLanguage": ["es", "pt", "en"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.cheotnun.com/tienda?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
  return schema;
}

export function generateProductSchema(product: any, locale: string = "es") {
  const baseUrl = "https://www.cheotnun.com";
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image ? [product.image] : [],
    "url": `${baseUrl}/tienda/produto/${product.slug}`,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": product.brand?.name || "K-Beauty"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price_promo || product.price,
      "priceCurrency": "USD",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Cheotnun K-Beauty"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "15.00",
          "currency": "USD"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 3,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 7,
            "maxValue": 25,
            "unitCode": "DAY"
          }
        }
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "48",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": "Cliente Verificado"
      }
    },
    "category": product.category?.name || "Skincare",
    "material": product.volume || "",
    "audience": {
      "@type": "PeopleAudience",
      "suggestedGender": "Unisex"
    }
  };
  return schema;
}

export function generateBlogPostingSchema(post: any) {
  const baseUrl = "https://www.cheotnun.com";
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.subtitle || post.seo_description,
    "image": post.image ? [post.image] : [],
    "datePublished": post.created_at,
    "dateModified": post.updated_at,
    "author": {
      "@type": "Person",
      "name": post.author || "Cheotnun Team",
      "url": baseUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "Cheotnun K-Beauty",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/cheotnun-k-beauty-logo-oficial.webp`
      }
    },
    "url": `${baseUrl}/blog/${post.slug}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug}`
    },
    "articleBody": post.content,
    "wordCount": post.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0,
    "inLanguage": post.language || "es",
    "keywords": post.seo_keywords?.split(",").map((k: string) => k.trim()) || []
  };
  return schema;
}

export function generateBreadcrumbSchema(items: Array<{name: string; url: string}>) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
  return schema;
}

export function generateFAQSchema(faqs: Array<{question: string; answer: string}>) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
  return schema;
}

export function generateLocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Cheotnun K-Beauty",
    "image": "https://www.cheotnun.com/images/cheotnun-k-beauty-logo-oficial.webp",
    "telephone": "+34-600-111-222",
    "email": "hola@cheotnun.com",
    "url": "https://www.cheotnun.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Calle Gran Vía 12",
      "addressLocality": "Madrid",
      "postalCode": "28013",
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "40.4168",
      "longitude": "-3.7038"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    "priceRange": "$$",
    "servesCuisine": "K-Beauty",
    "acceptsReservations": false
  };
  return schema;
}

export function generateCollectionPageSchema(collectionData: any) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": collectionData.name,
    "description": collectionData.description,
    "url": collectionData.url,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": collectionData.itemCount,
      "itemListElement": collectionData.items?.map((item: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": item.url
      }))
    }
  };
  return schema;
}

export function generateHowToSchema(steps: Array<{name: string; text: string; image?: string}>) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Rutina de Skincare Coreano",
    "description": "Guía paso a paso para una rutina completa de skincare coreano",
    "step": steps.map((step) => ({
      "@type": "HowToStep",
      "name": step.name,
      "text": step.text,
      "image": step.image ? [step.image] : []
    }))
  };
  return schema;
}

export function generateVideoObjectSchema(videoData: {name: string; description: string; thumbnailUrl: string; uploadDate: string; duration: string; contentUrl: string}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": videoData.name,
    "description": videoData.description,
    "thumbnailUrl": videoData.thumbnailUrl,
    "uploadDate": videoData.uploadDate,
    "duration": videoData.duration,
    "contentUrl": videoData.contentUrl,
    "embedUrl": videoData.contentUrl,
    "interactionCount": "0"
  };
  return schema;
}

export function generateReviewSchema(reviewData: {author: string; rating: number; reviewBody: string; datePublished: string}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": reviewData.author
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": reviewData.rating.toString(),
      "bestRating": "5",
      "worstRating": "1"
    },
    "reviewBody": reviewData.reviewBody,
    "datePublished": reviewData.datePublished
  };
  return schema;
}