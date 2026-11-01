import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import DashboardClient from './DashboardClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - AppDrop APK & IPA Distribution',
  description: 'Manage mobile testing builds, generate QR codes and OTA install links for DEV, UAT, and PROD.',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  let releases: any[] = [];

  if (user) {
    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    profile = profileData;

    // Fetch user releases
    const { data: releasesData } = await supabase
      .from('releases')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (releasesData) {
      releases = releasesData;
    }
  } else {
    // Fetch public recent releases if not logged in
    const { data: publicReleases } = await supabase
      .from('releases')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (publicReleases) {
      releases = publicReleases;
    }
  }

  return (
    <DashboardClient
      initialUser={user}
      initialProfile={profile}
      initialReleases={releases}
    />
  );
}

