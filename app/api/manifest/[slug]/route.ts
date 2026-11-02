import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getReleaseFromMemory } from '@/lib/release-store';

export const dynamic = 'force-dynamic';

const isUuid = (val: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    let release = null;

    // 1. Query by slug
    const { data: bySlug } = await supabase
      .from('releases')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (bySlug) {
      release = bySlug;
    } else if (isUuid(slug)) {
      const { data: byId } = await supabase
        .from('releases')
        .select('*')
        .eq('id', slug)
        .maybeSingle();
      release = byId;
    }

    if (!release) {
      release = getReleaseFromMemory(slug);
    }

    if (!release) {
      return new NextResponse('Release not found', { status: 404 });
    }

    // Check expiration
    if (release.expires_at && new Date(release.expires_at) < new Date()) {
      return new NextResponse('Release has expired (Free tier retention limit reached)', { status: 410 });
    }

    const ipaUrl = release.file_url;
    const bundleId = release.bundle_id || 'com.app.distribution';
    const bundleVersion = release.version || '1.0.0';
    const appTitle = release.title || 'App Build';

    // Generate valid Apple Enterprise / Ad-Hoc OTA Distribution Manifest
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>items</key>
  <array>
    <dict>
      <key>assets</key>
      <array>
        <dict>
          <key>kind</key>
          <string>software-package</string>
          <key>url</key>
          <string><![CDATA[${ipaUrl}]]></string>
        </dict>
      </array>
      <key>metadata</key>
      <dict>
        <key>bundle-identifier</key>
        <string>${bundleId}</string>
        <key>bundle-version</key>
        <string>${bundleVersion}</string>
        <key>kind</key>
        <string>software</string>
        <key>title</key>
        <string>${appTitle}</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error generating iOS manifest:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
