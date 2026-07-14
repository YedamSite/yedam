import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const baseUrl = 'https://www.cheotnun.com'
  
  // URLs de todas as imagens
  const imageUrls: string[] = [
    // Imagens estáticas
    `${baseUrl}/images/logo.webp`,
    `${baseUrl}/images/banner.webp`,
  ]

  // Imagens dos produtos
  const products = db.get('products') || []
  products
    .filter((p: any) => p.status === 'active' && p.image)
    .forEach((product: any) => {
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

  // Gera o XML do sitemap de imagens
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${imageUrls.map((url) => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600',
    },
  })
}