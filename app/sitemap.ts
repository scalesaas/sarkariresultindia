import type { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://droponair.saasscale.in';

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/premium`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: releases } = await supabase
      .from('releases')
      .select('slug, created_at, expires_at')
      .order('created_at', { ascending: false })
      .limit(100);

    const releaseEntries: MetadataRoute.Sitemap = (releases || [])
      .filter((r) => !r.expires_at || new Date(r.expires_at) > new Date())
      .map((rel) => ({
        url: `${baseUrl}/download/${rel.slug}`,
        lastModified: rel.created_at ? new Date(rel.created_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));

    return [...staticEntries, ...releaseEntries];
  } catch {
    return staticEntries;
  }
}
