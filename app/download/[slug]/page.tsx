import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { cookies, headers } from 'next/headers';
import PublicInstallView from './PublicInstallView';
import { getReleaseFromMemory } from '@/lib/release-store';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  let release = null;

  try {
    const { data } = await supabase
      .from('releases')
      .select('title, version, environment, platform')
      .or(`slug.eq.${params.slug},id.eq.${params.slug}`)
      .single();
    release = data;
  } catch (e) {}

  if (!release) {
    release = getReleaseFromMemory(params.slug);
  }

  if (!release) {
    return {
      title: 'App Release Not Found',
    };
  }

  return {
    title: `Install ${release.title} v${release.version} (${release.environment})`,
    description: `Download and install ${release.title} for ${release.platform?.toUpperCase()} (${release.environment} release).`,
  };
}

export default async function DownloadPage({ params }: Props) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  let release = null;

  try {
    const { data } = await supabase
      .from('releases')
      .select('*')
      .or(`slug.eq.${params.slug},id.eq.${params.slug}`)
      .single();
    release = data;
  } catch (e) {}

  if (!release) {
    release = getReleaseFromMemory(params.slug);
  }

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
