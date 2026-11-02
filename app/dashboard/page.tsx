import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import DashboardClient from './DashboardClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - DropOnAir APK & IPA Distribution',
  description: 'Manage mobile testing builds, generate QR codes and OTA install links for DEV, UAT, and PROD on DropOnAir.',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  let releases: any[] = [];

  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    profile = profileData;

    const { data: releasesData } = await supabase
      .from('releases')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (releasesData) {
      releases = releasesData;
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
