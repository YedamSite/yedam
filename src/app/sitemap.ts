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
  const routes = staticRoutes.map((route) => {
    const url = `${baseUrl}${route}`
    const lastModified = new Date()
    
    let changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'] = 'monthly'
    let priority: MetadataRoute.Sitemap[0]['priority'] = 0.8
    
    if (route === '') {
      changeFrequency = 'daily'
      priority = 1.0
    } else if (route === '/tienda') {
      changeFrequency = 'daily'
      priority = 0.9
    } else if (route === '/blog') {
      changeFrequency = 'weekly'
      priority = 0.8
    }
    
    return {
      url,
      lastModified,
      changeFrequency,
      priority,
    }
  })

  // Dynamic routes - products
  const products = (await import('@/lib/db')).db.get('products') || []
  const productUrls = products
    .filter((p: any) => p.status === 'active')
    .map((product: any): MetadataRoute.Sitemap[0] => ({
      url: `${baseUrl}/tienda/produto/${product.slug}`,
      lastModified: new Date(product.updated_at || product.created_at || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  // Dynamic routes - blog posts
  const blogPosts = (await import('@/lib/db')).db.get('blog_posts') || []
  const blogUrls = blogPosts
    .filter((post: any) => post.status === 'published')
    .map((post: any): MetadataRoute.Sitemap[0] => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.created_at || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

  // Dynamic routes - routines
  const routines = (await import('@/lib/db')).db.get('routines') || []
  const routineUrls = routines
    .filter((r: any) => r.status === 'active')
    .map((routine: any): MetadataRoute.Sitemap[0] => ({
      url: `${baseUrl}/rutinas/${routine.slug}`,
      lastModified: new Date(routine.updated_at || routine.created_at || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

  // Imagens para Google Images
  const productsList = (await import('@/lib/db')).db.get('products') || []
  const categories = (await import('@/lib/db')).db.get('categories') || []
  const blogPostsList = (await import('@/lib/db')).db.get('blog_posts') || []
  
  const imageUrls = [
    `${baseUrl}/images/cheotnun-logo.webp`,
    `${baseUrl}/images/banner.webp`,
    ...productsList.filter((p: any) => p.status === 'active' && p.image).map((p: any) => p.image),
    ...categories.filter((c: any) => c.image).map((c: any) => c.image),
    ...blogPostsList.filter((post: any) => post.status === 'published' && post.image).map((post: any) => post.image),
  ].filter((url: string, index: number, self: string[]) => self.indexOf(url) === index) // Remove duplicates

  const imageEntries: MetadataRoute.Sitemap = imageUrls.map((url: string) => ({
    url,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...routes, ...productUrls, ...blogUrls, ...routineUrls, ...imageEntries]
}