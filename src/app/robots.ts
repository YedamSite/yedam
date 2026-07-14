import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.cheotnun.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/auth/',
          '/invoices/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/auth/',
          '/invoices/',
        ],
      },
      {
        userAgent: 'bingbot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/auth/',
          '/invoices/',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
        ],
      },
      {
        userAgent: 'bingbot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
        ],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/api/sitemap-images`,
    ],
  }
}