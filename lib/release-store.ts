// Global in-memory cache for fast lookups and demo fallback across Next.js bundles
const globalForReleases = globalThis as unknown as {
  __appdrop_releases: Map<string, any>;
};

if (!globalForReleases.__appdrop_releases) {
  globalForReleases.__appdrop_releases = new Map<string, any>();
}

export const releaseMemoryCache = globalForReleases.__appdrop_releases;

// Seed with demo build
if (!releaseMemoryCache.has('demo')) {
  const demoRelease = {
    id: 'demo-release-1',
    slug: 'demo',
    title: 'Sample iOS & Android Beta',
    platform: 'ios',
    environment: 'DEV',
    version: '1.0.0',
    build_number: '12',
    bundle_id: 'com.demo.mobileapp',
    min_os_version: 'iOS 15.0+',
    provisioning_type: 'Ad-Hoc',
    release_notes: 'Demo build for testing OTA install, public link generation, and QR code scanning.',
    file_name: 'demo-app.ipa',
    file_url: 'https://example-bucket.s3.amazonaws.com/builds/demo-app.ipa',
    file_size: 48500000,
    is_paid: false,
    expires_at: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    download_count: 5,
    created_at: new Date().toISOString(),
  };
  releaseMemoryCache.set('demo', demoRelease);
}

export function saveReleaseToMemory(release: any) {
  if (release?.slug) {
    releaseMemoryCache.set(release.slug, release);
  }
  if (release?.id) {
    releaseMemoryCache.set(release.id, release);
  }
}

export function getReleaseFromMemory(slugOrId: string) {
  return releaseMemoryCache.get(slugOrId) || null;
}
