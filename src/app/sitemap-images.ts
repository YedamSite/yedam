import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.cheotnun.com'
  
  // Imagens estáticas da pasta public/images
  const staticImages = [
    {
      url: `${baseUrl}/images/logo.webp`,
      title: 'Cheotnun K-Beauty Logo',
      caption: 'Logo oficial da Cheotnun K-Beauty - Cosméticos Coreanos Premium'
    },
    {
      url: `${baseUrl}/images/banner.webp`,
      title: 'Cheotnun K-Beauty Banner Hero',
      caption: 'Banner principal com cosméticos coreanos premium'
    }
  ]

  // Imagens dos produtos do banco de dados
  const products = db.get('products') || []
  const productImages = products
    .filter((p: any) => p.status === 'active' && p.image)
    .map((product: any) => ({
      url: product.image,
      title: `${product.name} - ${product.brand?.name || 'K-Beauty'}`,
      caption: product.description
    }))

  // Imagens das categorias
  const categories = db.get('categories') || []
  const categoryImages = categories
    .filter((c: any) => c.image)
    .map((category: any) => ({
      url: category.image,
      title: `Categoria: ${category.name}`,
      caption: category.description
    }))

  // Imagens dos posts do blog
  const blogPosts = db.get('blog_posts') || []
  const blogImages = blogPosts
    .filter((post: any) => post.status === 'published' && post.image)
    .map((post: any) => ({
      url: post.image,
      title: post.title,
      caption: post.subtitle || post.seo_description
    }))

  // Combina todas as imagens
  const allImages = [...staticImages, ...productImages, ...categoryImages, ...blogImages]

  // Cria entries do sitemap para cada imagem
  const imageEntries: MetadataRoute.Sitemap = allImages.map((img) => ({
    url: img.url,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
    images: [
      {
        url: img.url,
        title: img.title,
        caption: img.caption
      }
    ]
  }))

  return imageEntries
}