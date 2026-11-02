import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/supabase-api';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedSupabase(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    // Fetch only apps belonging to this authenticated user
    const { data: apps, error: appsError } = await supabase
      .from('apps')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (appsError) {
      console.error('Supabase fetch apps error:', appsError);
      return NextResponse.json({ apps: [], error: appsError.message }, { status: 400 });
    }

    // Fetch user's releases to aggregate release count and download count per app
    const { data: releases } = await supabase
      .from('releases')
      .select('app_id, download_count')
      .eq('user_id', user.id);

    const aggregatedApps = (apps || []).map((app) => {
      const appReleases = (releases || []).filter((r) => r.app_id === app.id);
      const totalDownloads = appReleases.reduce((sum, r) => sum + (r.download_count || 0), 0);
      return {
        ...app,
        release_count: appReleases.length,
        download_count: totalDownloads,
      };
    });

    return NextResponse.json({ apps: aggregatedApps });
  } catch (error: any) {
    console.error('Error in GET /api/apps:', error);
    return NextResponse.json({ apps: [], error: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedSupabase(req);

    if (!user) {
      return NextResponse.json(
        { error: 'You must be signed in to create an app.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, bundle_id, platform = 'both', icon_url } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'App name is required' }, { status: 400 });
    }

    const newApp = {
      name: name.trim(),
      bundle_id: bundle_id?.trim() || null,
      platform,
      icon_url: icon_url || null,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('apps')
      .insert(newApp)
      .select()
      .single();

    if (error) {
      console.error('Error inserting app:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      app: {
        ...data,
        release_count: 0,
        download_count: 0,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/apps:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create app' }, { status: 500 });
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
      return NextResponse.json({ error: 'App ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('apps')
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
