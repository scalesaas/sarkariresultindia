import React, { cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { cookies, headers } from 'next/headers';
import PublicInstallView from './PublicInstallView';
import { getReleaseFromMemory, saveReleaseToMemory } from '@/lib/release-store';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

const isUuid = (val: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

// Deduplicated across generateMetadata + DownloadPage & cached in memory
const fetchReleaseBySlugOrId = cache(async (slugOrId: string) => {
  // 1. Check fast in-memory store first (<1ms)
  const cached = getReleaseFromMemory(slugOrId);
  if (cached) return cached;

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 2. Query by slug
  const { data: bySlug } = await supabase
    .from('releases')
    .select('*')
    .eq('slug', slugOrId)
    .maybeSingle();

  if (bySlug) {
    saveReleaseToMemory(bySlug);
    return bySlug;
  }

  // 3. If valid UUID, query by id
  if (isUuid(slugOrId)) {
    const { data: byId } = await supabase
      .from('releases')
      .select('*')
      .eq('id', slugOrId)
      .maybeSingle();

    if (byId) {
      saveReleaseToMemory(byId);
      return byId;
    }
  }

  return null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const release = await fetchReleaseBySlugOrId(params.slug);

  if (!release) {
    return {
      title: 'App Release Not Found - DropOnAir',
      robots: { index: false, follow: false },
    };
  }

  const platformName = release.platform === 'ios' ? 'iOS (.IPA)' : 'Android (.APK)';
  const title = `Download & Install ${release.title} v${release.version} (${release.environment}) - ${platformName} | DropOnAir`;
  const description = `Over-The-Air (OTA) installation page for ${release.title} v${release.version} (Build ${release.build_number}) on ${platformName}. Scan QR code or tap to install directly via DropOnAir.`;

  return {
    title,
    description,
    keywords: [
      release.title,
      `${release.title} APK download`,
      `${release.title} IPA install`,
      'DropOnAir',
      'OTA app install',
      platformName,
      release.bundle_id || '',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      images: ['/Droponairbanner.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/Droponairbanner.png'],
    },
  };
}

export default async function DownloadPage({ params }: Props) {
  const release = await fetchReleaseBySlugOrId(params.slug);

  if (!release) {
    notFound();
  }

  // Detect origin from headers for manifest URL
  const headerList = headers();
  const host = headerList.get('host') || 'localhost:3000';
  const proto = headerList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const baseUrl = `${proto}://${host}`;

  return (
    <PublicInstallView
      release={release}
      baseUrl={baseUrl}
    />
  );
}
