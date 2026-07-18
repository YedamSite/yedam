import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
      // Se a imagem ainda não tem nome SEO, usar URL direta
      if (product.image && !imageUrls.includes(product.image)) {
        imageUrls.push(product.image)
      }
    })

  // Imagens das categorias
  const categories = db.get('categories') || []
  categories
    .filter((c: any) => c.image)
    .forEach((category: any) => {
      if (category.image && !imageUrls.includes(category.image)) {
        imageUrls.push(category.image)
      }
    })

  // Imagens dos posts do blog
  const blogPosts = db.get('blog_posts') || []
  blogPosts
    .filter((post: any) => post.status === 'published' && post.image)
    .forEach((post: any) => {
      if (post.image && !imageUrls.includes(post.image)) {
        imageUrls.push(post.image)
      }
    })

  // Gera o XML do sitemap de imagens otimizado para Google Images
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageUrls.map((url) => {
  const imageName = url.split('/').pop()?.replace('.webp', '').replace(/-/g, ' ') || 'imagem'
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${url}</image:loc>
      <image:title>${imageName}</image:title>
      <image:caption>CHEOTNUN K-BEAUTY - ${imageName}</image:caption>
    </image:image>
  </url>`
}).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}