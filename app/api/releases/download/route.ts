import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Call RPC or fallback update
    const { error: rpcError } = await supabase.rpc('increment_release_download', {
      release_slug: slug,
    });

    if (rpcError) {
      // Fallback manual increment
      const { data: current } = await supabase
        .from('releases')
        .select('download_count')
        .eq('slug', slug)
        .single();

      if (current) {
        await supabase
          .from('releases')
          .update({ download_count: (current.download_count || 0) + 1 })
          .eq('slug', slug);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

