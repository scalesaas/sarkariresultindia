import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://droponair.saasscale.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/premium', '/login', '/download/', '/d/'],
        disallow: ['/api/', '/auth/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

