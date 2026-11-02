import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { cookies, headers } from 'next/headers';
import PublicInstallView from './PublicInstallView';
import { getReleaseFromMemory } from '@/lib/release-store';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

const isUuid = (val: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

async function fetchReleaseBySlugOrId(slugOrId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Try querying by slug first
  const { data: bySlug, error: slugErr } = await supabase
    .from('releases')
    .select('*')
    .eq('slug', slugOrId)
    .maybeSingle();

  if (bySlug) return bySlug;

  // 2. If valid UUID, try querying by id
  if (isUuid(slugOrId)) {
    const { data: byId } = await supabase
      .from('releases')
      .select('*')
      .eq('id', slugOrId)
      .maybeSingle();

    if (byId) return byId;
  }

  // 3. Fallback to memory store if demo
  return getReleaseFromMemory(slugOrId);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const release = await fetchReleaseBySlugOrId(params.slug);

  if (!release) {
    return {
      title: 'App Release Not Found - AppsOnAir',
    };
  }

  return {
    title: `Install ${release.title} v${release.version} (${release.environment}) - AppsOnAir`,
    description: `Download and install ${release.title} for ${release.platform?.toUpperCase()} (${release.environment} release).`,
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
