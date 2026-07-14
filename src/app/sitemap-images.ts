import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Cria entries do sitemap - apenas URLs das imagens
  const imageEntries: MetadataRoute.Sitemap = imageUrls.map((url) => ({
    url,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return imageEntries
}