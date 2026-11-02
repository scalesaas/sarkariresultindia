import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/supabase-api';
import { deleteFromS3 } from '@/lib/s3';
import { saveReleaseToMemory } from '@/lib/release-store';

export const dynamic = 'force-dynamic';

function generateSlug() {
  return Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);
}

const isUuid = (val?: string | null) =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

export async function GET(req: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedSupabase(req);

    const url = new URL(req.url);
    const environment = url.searchParams.get('environment');
    const platform = url.searchParams.get('platform');
    const slug = url.searchParams.get('slug');
    const appId = url.searchParams.get('app_id');

    // Public single-release lookup by slug
    if (slug) {
      const { data, error } = await supabase
        .from('releases')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error || !data) {
        return NextResponse.json({ error: error?.message || 'Release not found' }, { status: 404 });
      }
      return NextResponse.json({ release: data });
    }

    // Dashboard listing requires authenticated user
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    let query = supabase
      .from('releases')
      .select('*')
      .eq('user_id', user.id);

    if (appId && isUuid(appId)) {
      query = query.eq('app_id', appId);
    }

    if (environment && environment !== 'ALL' && environment !== 'All') {
      query = query.eq('environment', environment);
    }

    if (platform && platform !== 'ALL' && platform !== 'All') {
      query = query.eq('platform', platform);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ releases: [], error: error.message }, { status: 400 });
    }

    return NextResponse.json({ releases: data || [] });
  } catch (error: any) {
    console.error('Error fetching releases:', error);
    return NextResponse.json({ releases: [], error: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedSupabase(req);

    if (!user) {
      return NextResponse.json(
        { error: 'You must be signed in to upload a release.' },
        { status: 401 }
      );
    }

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
      icon_url,
    } = body;

    if (!file_url || !file_name || !platform) {
      return NextResponse.json(
        { error: 'file_url, file_name, and platform are required' },
        { status: 400 }
      );
    }

    const cleanTitle = (title || file_name.replace(/\.[^/.]+$/, '')).trim();
    const cleanBundleId = bundle_id || (platform === 'ios' ? 'com.app.ios' : 'com.app.android');

    // Ensure a valid App exists in public.apps for this user
    let finalAppId: string | null = isUuid(app_id) ? app_id : null;

    if (!finalAppId) {
      // Check if user already has an app with this name or bundle_id
      const { data: existingApps } = await supabase
        .from('apps')
        .select('id, name, bundle_id')
        .eq('user_id', user.id);

      const matchedApp = (existingApps || []).find(
        (a) =>
          (a.bundle_id && a.bundle_id === cleanBundleId) ||
          a.name.toLowerCase() === cleanTitle.toLowerCase()
      );

      if (matchedApp) {
        finalAppId = matchedApp.id;
      } else {
        // Automatically create the App record for this user
        const { data: createdApp } = await supabase
          .from('apps')
          .insert({
            user_id: user.id,
            name: cleanTitle,
            bundle_id: cleanBundleId,
            platform: 'both',
            icon_url: icon_url || null,
          })
          .select('id')
          .single();

        if (createdApp?.id) {
          finalAppId = createdApp.id;
        }
      }
    } else {
      // Update parent app timestamp (and icon if provided)
      const updatePayload: any = { updated_at: new Date().toISOString() };
      if (icon_url) updatePayload.icon_url = icon_url;
      await supabase
        .from('apps')
        .update(updatePayload)
        .eq('id', finalAppId)
        .eq('user_id', user.id);
    }

    // Check user profile for paid tier
    let isPaidUser = false;
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_paid, plan_tier')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.is_paid || profile?.plan_tier === 'paid') {
      isPaidUser = true;
    }

    // Retention policy: Free = 20 days, Paid = Lifetime (null)
    const expiresAt = isPaidUser
      ? null
      : new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();

    const slug = generateSlug();

    const newRelease = {
      slug,
      user_id: user.id,
      app_id: finalAppId,
      title: cleanTitle,
      platform,
      environment,
      version,
      build_number,
      bundle_id: cleanBundleId,
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

    const { data, error } = await supabase
      .from('releases')
      .insert(newRelease)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert release error:', error);
      return NextResponse.json(
        { error: `Database save error: ${error.message}` },
        { status: 400 }
      );
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
    const { supabase, user } = await getAuthenticatedSupabase(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Release ID is required' }, { status: 400 });
    }

    // Get release to find s3_key and verify ownership
    const { data: release } = await supabase
      .from('releases')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (release?.s3_key) {
      await deleteFromS3(release.s3_key);
    }

    const { error } = await supabase
      .from('releases')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
