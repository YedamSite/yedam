import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Forçar renderização dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Função para escapar caracteres especiais em XML
function escapeXml(str: string): string {
  if (!str) return str;
  return str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
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

// Função para formatar data ISO-8601 válida
function formatLastMod(date: string | number | Date): string {
  try {
    return new Date(date).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export async function GET() {
  const baseUrl = 'https://www.cheotnun.com'
  
  // Páginas estáticas PÚBLICAS
  const staticRoutes = [
    '',
    '/tienda',
    '/rutinas',
    '/blog',
    '/experiencias',
    '/ayuda/envios',
    '/ayuda/devoluciones',
    '/politica-de-privacidad',
    '/terminos',
  ]

  const xmlEntries: string[] = []

  // Static routes
  staticRoutes.forEach((route) => {
    const url = escapeXml(`${baseUrl}${route}`)
    if (!isValidUrl(url)) return;
    
    let changeFrequency = 'monthly'
    let priority = '0.8'
    
    if (route === '') {
      changeFrequency = 'daily'
      priority = '1.0'
    } else if (route === '/tienda') {
      changeFrequency = 'daily'
      priority = '0.9'
    } else if (route === '/blog') {
      changeFrequency = 'weekly'
      priority = '0.8'
    }
    
    xmlEntries.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${formatLastMod(new Date())}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
  </url>`)
  })

  // Products
  const products = db.get('products') || []
  products
    .filter((p: any) => p.status === 'active' && p.slug)
    .forEach((product: any) => {
      if (!product.slug || typeof product.slug !== 'string') return;
      
      const url = escapeXml(`${baseUrl}/tienda/produto/${product.slug.trim()}`)
      if (!isValidUrl(url)) return;
      
      xmlEntries.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${formatLastMod(product.updated_at || product.created_at || Date.now())}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`)
    })

  // Blog posts
  const blogPosts = db.get('blog_posts') || []
  blogPosts
    .filter((post: any) => post.status === 'published' && post.slug)
    .forEach((post: any) => {
      if (!post.slug || typeof post.slug !== 'string') return;
      
      const url = escapeXml(`${baseUrl}/blog/${post.slug.trim()}`)
      if (!isValidUrl(url)) return;
      
      xmlEntries.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${formatLastMod(post.updated_at || post.created_at || Date.now())}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
    })

  // Routines
  const routines = db.get('routines') || []
  routines
    .filter((r: any) => r.status === 'active' && r.slug)
    .forEach((routine: any) => {
      if (!routine.slug || typeof routine.slug !== 'string') return;
      
      const url = escapeXml(`${baseUrl}/rutinas/${routine.slug.trim()}`)
      if (!isValidUrl(url)) return;
      
      xmlEntries.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${formatLastMod(routine.updated_at || routine.created_at || Date.now())}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`)
    })

  // Images
  const productsList = db.get('products') || []
  const categories = db.get('categories') || []
  const blogPostsList = db.get('blog_posts') || []
  
  const rawImageUrls = [
    `${baseUrl}/images/cheotnun-k-beauty-logo-oficial.webp`,
    `${baseUrl}/images/cheotnun-k-beauty-banner-principal-skincare-coreano.webp`,
    ...productsList.filter((p: any) => p.status === 'active' && p.image).map((p: any) => p.image),
    ...categories.filter((c: any) => c.image).map((c: any) => c.image),
    ...blogPostsList.filter((post: any) => post.status === 'published' && post.image).map((post: any) => post.image),
  ]
  
  const imageUrls = rawImageUrls
    .map((url: string) => escapeXml(url))
    .filter((url: string) => url && url !== '' && url !== 'undefined')
    .filter((url: string, index: number, self: string[]) => self.indexOf(url) === index)
    .filter((url: string) => isValidUrl(url))

  imageUrls.forEach((url: string) => {
    xmlEntries.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${formatLastMod(new Date())}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`)
  })

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries.join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600',
    },
  })
}