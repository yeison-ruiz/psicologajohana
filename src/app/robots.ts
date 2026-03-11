import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/paciente/', '/dashboard/', '/api/'],
    },
    sitemap: 'https://psicologajohanavillabon.com/sitemap.xml',
  }
}
