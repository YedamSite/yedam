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
  
  // Mapear cada imagem para a URL da página onde ela aparece (exigência do Google)
  const imageEntries: { pageUrl: string, imageUrl: string }[] = []

  // Imagens estáticas (Home)
  imageEntries.push({
    pageUrl: `${baseUrl}/`,
    imageUrl: `${baseUrl}/images/cheotnun-k-beauty-logo-oficial.webp`
  });
  imageEntries.push({
    pageUrl: `${baseUrl}/`,
    imageUrl: `${baseUrl}/images/cheotnun-k-beauty-banner-principal-skincare-coreano.webp`
  });

  // Imagens dos produtos
  const products = db.get('products') || []
  products
    .filter((p: any) => p.status === 'active' && p.image && p.slug)
    .forEach((product: any) => {
      imageEntries.push({
        pageUrl: `${baseUrl}/tienda/produto/${product.slug.trim()}`,
        imageUrl: product.image
      });
    })

  // Imagens das categorias
  const categories = db.get('categories') || []
  categories
    .filter((c: any) => c.image && c.slug)
    .forEach((category: any) => {
      imageEntries.push({
        pageUrl: `${baseUrl}/tienda`, // Pode ser uma página de categoria se houver, ou tienda
        imageUrl: category.image
      });
    })

  // Imagens dos posts do blog
  const blogPosts = db.get('blog_posts') || []
  blogPosts
    .filter((post: any) => post.status === 'published' && post.image && post.slug)
    .forEach((post: any) => {
      imageEntries.push({
        pageUrl: `${baseUrl}/blog/${post.slug.trim()}`,
        imageUrl: post.image
      });
    })

  // Filtrar duplicatas e URLs inválidas
  const uniqueEntries = new Map<string, { pageUrl: string, imageUrl: string }>();
  
  imageEntries.forEach(entry => {
    if (entry.imageUrl && isValidUrl(entry.imageUrl) && isValidUrl(entry.pageUrl)) {
      uniqueEntries.set(entry.imageUrl, entry); // Garante uma imagem por página no sitemap (ou agrupa por imagem única)
    }
  });

  // Agrupar imagens por pageUrl (o formato ideal do sitemap de imagens é uma <url> por página, com várias <image:image> dentro)
  const groupedByPage = new Map<string, string[]>();
  Array.from(uniqueEntries.values()).forEach(entry => {
    if (!groupedByPage.has(entry.pageUrl)) {
      groupedByPage.set(entry.pageUrl, []);
    }
    groupedByPage.get(entry.pageUrl)?.push(entry.imageUrl);
  });

  // Gera o XML do sitemap de imagens otimizado para Google Images
  const xmlEntries: string[] = [];
  
  groupedByPage.forEach((images, pageUrl) => {
    let imagesXml = '';
    images.forEach(imgUrl => {
      const imageName = escapeXml(imgUrl.split('/').pop()?.replace(/\.(webp|jpg|jpeg|png)/, '').replace(/-/g, ' ') || 'imagem');
      imagesXml += `
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${imageName}</image:title>
      <image:caption>CHEOTNUN K-BEAUTY - ${imageName}</image:caption>
    </image:image>`;
    });

    xmlEntries.push(`  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <lastmod>${formatLastMod(new Date())}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>${imagesXml}
  </url>`);
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlEntries.join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}