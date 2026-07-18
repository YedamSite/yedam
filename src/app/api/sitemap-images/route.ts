import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Função para escapar caracteres especiais em XML
function escapeXml(str: string): string {
  if (!str) return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Função para validar URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Função para formatar data ISO-8601
function formatLastMod(date: string | number | Date): string {
  try {
    return new Date(date).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export async function GET() {
  const baseUrl = 'https://www.cheotnun.com'
  
  // URLs de todas as imagens otimizadas para SEO
  const imageUrls: string[] = [
    // Imagens estáticas otimizadas
    `${baseUrl}/images/cheotnun-k-beauty-logo-oficial.webp`,
    `${baseUrl}/images/cheotnun-k-beauty-banner-principal-skincare-coreano.webp`,
  ]

  // Imagens dos produtos com nomes SEO-friendly
  const products = db.get('products') || []
  products
    .filter((p: any) => p.status === 'active' && p.image)
    .forEach((product: any) => {
      if (product.image && !imageUrls.includes(product.image)) {
        const escapedUrl = escapeXml(product.image);
        if (isValidUrl(escapedUrl) && !imageUrls.includes(escapedUrl)) {
          imageUrls.push(escapedUrl);
        }
      }
    })

  // Imagens das categorias
  const categories = db.get('categories') || []
  categories
    .filter((c: any) => c.image)
    .forEach((category: any) => {
      if (category.image) {
        const escapedUrl = escapeXml(category.image);
        if (isValidUrl(escapedUrl) && !imageUrls.includes(escapedUrl)) {
          imageUrls.push(escapedUrl);
        }
      }
    })

  // Imagens dos posts do blog
  const blogPosts = db.get('blog_posts') || []
  blogPosts
    .filter((post: any) => post.status === 'published' && post.image)
    .forEach((post: any) => {
      if (post.image) {
        const escapedUrl = escapeXml(post.image);
        if (isValidUrl(escapedUrl) && !imageUrls.includes(escapedUrl)) {
          imageUrls.push(escapedUrl);
        }
      }
    })

  // Filtrar URLs inválidas ou vazias
  const validImageUrls = imageUrls.filter(url => url && url !== '' && url !== 'undefined' && isValidUrl(url));

  // Gera o XML do sitemap de imagens otimizado para Google Images
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${validImageUrls.map((url) => {
  const imageName = escapeXml(url.split('/').pop()?.replace('.webp', '').replace(/-/g, ' ') || 'imagem');
  const lastMod = formatLastMod(new Date());
  return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${escapeXml(url)}</image:loc>
      <image:title>${imageName}</image:title>
      <image:caption>CHEOTNUN K-BEAUTY - ${imageName}</image:caption>
    </image:image>
  </url>`;
}).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}