import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { deleteFromS3 } from '@/lib/s3';
import { saveReleaseToMemory } from '@/lib/release-store';

// Helper to generate random 8-character slug
function generateSlug() {
  return Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    const url = new URL(req.url);
    const environment = url.searchParams.get('environment');
    const platform = url.searchParams.get('platform');
    const slug = url.searchParams.get('slug');

    let query = supabase.from('releases').select('*');

    if (slug) {
      const { data, error } = await supabase
        .from('releases')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      return NextResponse.json({ release: data });
    }

    // Filter by user if logged in
    if (user) {
      query = query.eq('user_id', user.id);
    }

    if (environment && environment !== 'ALL') {
      query = query.eq('environment', environment);
    }

    if (platform && platform !== 'ALL') {
      query = query.eq('platform', platform);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ releases: [], error: error.message });
    }

    return NextResponse.json({ releases: data || [] });
  } catch (error: any) {
    console.error('Error fetching releases:', error);
    return NextResponse.json({ releases: [], error: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const {
      title,
      platform,
      environment = 'DEV',
      version = '1.0.0',
      build_number = '1',
      bundle_id,
      min_os_version,
      provisioning_type = 'Ad-Hoc',
      release_notes,
      file_name,
      file_url,
      s3_key,
      file_size = 0,
      app_id,
    } = body;

    if (!file_url || !file_name || !platform) {
      return NextResponse.json(
        { error: 'file_url, file_name, and platform are required' },
        { status: 400 }
      );
    }

    let isPaidUser = false;

    // Check user profile for paid tier if logged in
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_paid, plan_tier')
        .eq('id', user.id)
        .single();

      if (profile?.is_paid || profile?.plan_tier === 'paid') {
        isPaidUser = true;
      }
    }

    // Retention policy:
    // Free users: 20 days retention
    // Paid users: Lifetime (null)
    const expiresAt = isPaidUser
      ? null
      : new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();

    const slug = generateSlug();

    const newRelease = {
      slug,
      user_id: user?.id || null,
      app_id: app_id || null,
      title: title || file_name.replace(/\.[^/.]+$/, ''),
      platform,
      environment,
      version,
      build_number,
      bundle_id: bundle_id || (platform === 'ios' ? 'com.app.ios' : 'com.app.android'),
      min_os_version: min_os_version || (platform === 'ios' ? 'iOS 15.0+' : 'Android 8.0+'),
      provisioning_type,
      release_notes: release_notes || '',
      file_name,
      file_url,
      s3_key: s3_key || null,
      file_size,
      is_paid: isPaidUser,
      expires_at: expiresAt,
      download_count: 0,
    };

    saveReleaseToMemory(newRelease);

    const { data, error } = await supabase
      .from('releases')
      .insert(newRelease)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert release error:', error);
      // If table does not exist or db error, return the release object directly with a note
      const fallbackRelease = { ...newRelease, id: 'temp-' + Date.now(), created_at: new Date().toISOString() };
      saveReleaseToMemory(fallbackRelease);
      return NextResponse.json({
        success: true,
        dbSaved: false,
        warning: 'Supabase table error: Please run supabase-schema.sql in Supabase SQL editor',
        release: fallbackRelease,
      });
    }

    saveReleaseToMemory(data);

    return NextResponse.json({
      success: true,
      dbSaved: true,
      release: data,
    });
  } catch (error: any) {
    console.error('Error creating release:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create release' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Release ID is required' }, { status: 400 });
    }

    // Get release to find s3_key
    const { data: release } = await supabase
      .from('releases')
      .select('*')
      .eq('id', id)
      .single();

    if (release?.s3_key) {
      await deleteFromS3(release.s3_key);
    }

    const { error } = await supabase
      .from('releases')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
