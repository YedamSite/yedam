import { MetadataRoute } from 'next'

// Função para escapar caracteres especiais em URLs
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.cheotnun.com'
  
  // Páginas estáticas PÚBLICAS (remover dashboard e admin)
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

  // Generate sitemap entries com URLs validadas
  const routes = staticRoutes.map((route) => {
    const url = escapeXml(`${baseUrl}${route}`)
    
    // Validar URL
    if (!isValidUrl(url)) {
      return null;
    }
    
    const lastModified = formatLastMod(new Date())
    
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
  }).filter((route): route is NonNullable<typeof route> => route !== null)

  // Dynamic routes - products (apenas produtos ativos)
  const products = (await import('@/lib/db')).db.get('products') || []
  const productUrls = products
    .filter((p: any) => p.status === 'active' && p.slug)
    .map((product: any): MetadataRoute.Sitemap[0] | null => {
      // Validar slug
      if (!product.slug || typeof product.slug !== 'string') {
        return null;
      }
      
      const url = escapeXml(`${baseUrl}/tienda/produto/${product.slug.trim()}`)
      
      if (!isValidUrl(url)) {
        return null;
      }
      
      return {
        url,
        lastModified: formatLastMod(product.updated_at || product.created_at || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.7,
      }
    })
    .filter((url): url is NonNullable<typeof url> => url !== null)

  // Dynamic routes - blog posts (apenas posts publicados)
  const blogPosts = (await import('@/lib/db')).db.get('blog_posts') || []
  const blogUrls = blogPosts
    .filter((post: any) => post.status === 'published' && post.slug)
    .map((post: any): MetadataRoute.Sitemap[0] | null => {
      // Validar slug
      if (!post.slug || typeof post.slug !== 'string') {
        return null;
      }
      
      const url = escapeXml(`${baseUrl}/blog/${post.slug.trim()}`)
      
      if (!isValidUrl(url)) {
        return null;
      }
      
      return {
        url,
        lastModified: formatLastMod(post.updated_at || post.created_at || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.8,
      }
    })
    .filter((url): url is NonNullable<typeof url> => url !== null)

  // Dynamic routes - routines (apenas rotinas ativas)
  const routines = (await import('@/lib/db')).db.get('routines') || []
  const routineUrls = routines
    .filter((r: any) => r.status === 'active' && r.slug)
    .map((routine: any): MetadataRoute.Sitemap[0] | null => {
      // Validar slug
      if (!routine.slug || typeof routine.slug !== 'string') {
        return null;
      }
      
      const url = escapeXml(`${baseUrl}/rutinas/${routine.slug.trim()}`)
      
      if (!isValidUrl(url)) {
        return null;
      }
      
      return {
        url,
        lastModified: formatLastMod(routine.updated_at || routine.created_at || Date.now()),
        changeFrequency: 'monthly',
        priority: 0.7,
      }
    })
    .filter((url): url is NonNullable<typeof url> => url !== null)

  // Imagens para Google Images (apenas URLs válidas)
  const productsList = (await import('@/lib/db')).db.get('products') || []
  const categories = (await import('@/lib/db')).db.get('categories') || []
  const blogPostsList = (await import('@/lib/db')).db.get('blog_posts') || []
  
  const imageUrls = [
    `${baseUrl}/images/cheotnun-k-beauty-logo-oficial.webp`,
    `${baseUrl}/images/cheotnun-k-beauty-banner-principal-skincare-coreano.webp`,
    ...productsList.filter((p: any) => p.status === 'active' && p.image).map((p: any) => escapeXml(p.image)),
    ...categories.filter((c: any) => c.image).map((c: any) => escapeXml(c.image)),
    ...blogPostsList.filter((post: any) => post.status === 'published' && post.image).map((post: any) => escapeXml(post.image)),
  ]
    .filter((url: string): url is NonNullable<typeof url> => url !== null && url !== '' && url !== 'undefined')
    .filter((url: string, index: number, self: string[]) => self.indexOf(url) === index) // Remove duplicates
    .filter((url: string) => isValidUrl(url)) // Apenas URLs válidas

  const imageEntries: MetadataRoute.Sitemap = imageUrls.map((url: string) => ({
    url,
    lastModified: formatLastMod(new Date()),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  // Juntar todas as URLs e remover duplicatas
  const allUrls = [...routes, ...productUrls, ...blogUrls, ...routineUrls, ...imageEntries]
  
  // Remover URLs duplicadas baseado no url
  const uniqueUrls = allUrls.filter((entry, index, self) => 
    index === self.findIndex((e) => e.url === entry.url)
  )

  return uniqueUrls
}