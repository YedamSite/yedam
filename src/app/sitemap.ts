import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.cheotnun.com'
  
  // Static pages with language variants
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

  // Generate sitemap entries with hreflang alternatives
  const routes = staticRoutes.flatMap((route) => {
    const url = `${baseUrl}${route}`
    const lastModified = new Date()
    
    // Return one entry per route - hreflang will be in metadata
    return {
      url,
      lastModified,
      changeFrequency: route === '' ? 'daily' : route === '/tienda' ? 'daily' : route === '/blog' ? 'weekly' : 'monthly' as const,
      priority: route === '' ? 1.0 : route === '/tienda' ? 0.9 : 0.8,
    }
  })

  // Dynamic routes - products
  const products = (await import('@/lib/db')).db.get('products') || []
  const productUrls = products
    .filter((p: any) => p.status === 'active')
    .map((product: any) => ({
      url: `${baseUrl}/tienda/produto/${product.slug}`,
      lastModified: new Date(product.updated_at || product.created_at || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  // Dynamic routes - blog posts
  const blogPosts = (await import('@/lib/db')).db.get('blog_posts') || []
  const blogUrls = blogPosts
    .filter((post: any) => post.status === 'published')
    .map((post: any) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.created_at || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  // Dynamic routes - routines
  const routines = (await import('@/lib/db')).db.get('routines') || []
  const routineUrls = routines
    .filter((r: any) => r.status === 'active')
    .map((routine: any) => ({
      url: `${baseUrl}/rutinas/${routine.slug}`,
      lastModified: new Date(routine.updated_at || routine.created_at || Date.now()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  return [...routes, ...productUrls, ...blogUrls, ...routineUrls]
}