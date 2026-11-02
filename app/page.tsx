'use client';

import React, { useState, useRef, useEffect } from 'react';
import Script from 'next/script';
import {
  Apple,
  Smartphone,
  Upload,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileCode,
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import GoogleAdUnit from '@/components/GoogleAdUnit';

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPaidUser, setIsPaidUser] = useState(false);

  // Live .IPA / .APK Binary Inspector State
  const [inspectedFile, setInspectedFile] = useState<File | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectedData, setInspectedData] = useState<{
    title: string;
    bundleId: string;
    version: string;
    buildNumber: string;
    minOs: string;
    platform: 'ios' | 'android';
    icon: string | null;
    sizeMB: string;
  } | null>(null);
  const inspectorInputRef = useRef<HTMLInputElement>(null);

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          setIsLoggedIn(true);
          const { data: prof } = await supabase
            .from('profiles')
            .select('is_paid, plan_tier')
            .eq('id', session.user.id)
            .maybeSingle();
          if (prof?.is_paid || prof?.plan_tier === 'paid') {
            setIsPaidUser(true);
          }
        }
      });
    } catch {
      // Ignore if env vars not loaded
    }
  }, []);

  const handleInspectFile = async (file: File) => {
    setInspectedFile(file);
    setIsInspecting(true);
    const isIos = file.name.toLowerCase().endsWith('.ipa');
    const platform: 'ios' | 'android' = isIos ? 'ios' : 'android';
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

    try {
      const AppInfoParser = typeof window !== 'undefined' ? (window as any).AppInfoParser : null;
      if (AppInfoParser) {
        const parser = new AppInfoParser(file);
        const result = await parser.parse();
        if (result) {
          if (platform === 'ios') {
            const title =
              result.CFBundleDisplayName ||
              result.CFBundleName ||
              result.CFBundleExecutable ||
              file.name.replace(/\.ipa$/i, '');
            const version = String(result.CFBundleShortVersionString || result.CFBundleVersion || '1.0.0');
            const buildNumber = String(result.CFBundleVersion || '1');
            const bundleId = String(result.CFBundleIdentifier || 'com.ios.app');
            const minOs = result.MinimumOSVersion ? `iOS ${result.MinimumOSVersion}+` : 'iOS 14.0+';

            setInspectedData({
              title,
              bundleId,
              version,
              buildNumber,
              minOs,
              platform: 'ios',
              icon: result.icon || null,
              sizeMB,
            });
            setIsInspecting(false);
            return;
          } else {
            const appLabel = result.application?.label;
            const title = Array.isArray(appLabel)
              ? appLabel[0]
              : typeof appLabel === 'string'
              ? appLabel
              : file.name.replace(/\.apk$/i, '');
            const version = String(result.versionName || '1.0.0');
            const buildNumber = String(result.versionCode || '1');
            const bundleId = String(result.package || 'com.android.app');
            const minSdk = result.usesSdk?.minSdkVersion;
            const minOs = minSdk ? `Android SDK ${minSdk}+` : 'Android 8.0+';

            setInspectedData({
              title,
              bundleId,
              version,
              buildNumber,
              minOs,
              platform: 'android',
              icon: result.icon || null,
              sizeMB,
            });
            setIsInspecting(false);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Browser inspection fallback:', e);
    }

    setInspectedData({
      title: file.name.replace(/\.(ipa|apk)$/i, ''),
      bundleId: isIos ? 'com.company.iosapp' : 'com.company.androidapp',
      version: '1.0.0',
      buildNumber: '1',
      minOs: isIos ? 'iOS 15.0+' : 'Android 8.0+',
      platform,
      icon: null,
      sizeMB,
    });
    setIsInspecting(false);
  };

  const faqs = [
    {
      q: 'How does iOS (.IPA) Over-The-Air installation work?',
      a: 'DropOnAir generates an HTTPS XML property list (manifest.plist) for your uploaded .ipa and serves it via Apple’s native itms-services:// protocol. Testers open the link in Safari on their iPhone or iPad and tap Install.',
    },
    {
      q: 'What signing profile is required for iOS builds?',
      a: 'iOS builds must be signed with an Apple Development, Ad-Hoc (with the tester’s device UDID registered), or Enterprise In-House provisioning profile.',
    },
    {
      q: 'How long are builds stored on droponair.saasscale.in?',
      a: 'Free tier builds are retained for 20 days. Upgrading to the Lifetime Pro plan removes the expiration limit so your builds remain hosted permanently.',
    },
    {
      q: 'Is there a file size limit for .IPA and .APK uploads?',
      a: 'DropOnAir uploads directly to AWS S3 using presigned URLs with automatic 5MB multipart chunking, supporting large mobile binaries without HTTP payload limits.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Script src="/app-info-parser.min.js" strategy="afterInteractive" />

      {/* 1. CLEAN HEADER */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="DropOnAir" className="w-8 h-8 object-contain" />
              <span className="font-bold text-base text-slate-900 tracking-tight">DropOnAir</span>
            </a>

            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
              <a href="#workflow" className="hover:text-slate-900 transition">
                How it Works
              </a>
              <a href="#specs" className="hover:text-slate-900 transition">
                Specifications
              </a>
              <a href="#pricing" className="hover:text-slate-900 transition">
                Pricing
              </a>
              <a href="#faq" className="hover:text-slate-900 transition">
                FAQ
              </a>
              {!isPaidUser && (
                <a href="/premium" className="text-[#0066FF] font-semibold hover:underline">
                  Buy Premium
                </a>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <a
                href="/dashboard"
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            ) : (
              <>
                <a
                  href="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
                >
                  Sign In
                </a>
                <a
                  href="/dashboard"
                  className="px-4 py-2 bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5"
                >
                  <span>Upload Build</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. HERO + LIVE BINARY INSPECTOR */}
        <section className="border-b border-slate-200 bg-[#FAFAFA] py-16 sm:py-24 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Direct Engineering Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 border border-slate-200 bg-white px-3 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>droponair.saasscale.in</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15]">
                Over-the-air iOS &amp; Android build distribution.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Upload your signed <code className="font-mono text-xs bg-slate-200/70 px-1.5 py-0.5 rounded text-slate-900">.ipa</code> or <code className="font-mono text-xs bg-slate-200/70 px-1.5 py-0.5 rounded text-slate-900">.apk</code> binary. DropOnAir extracts package metadata, generates the Apple <code className="font-mono text-xs bg-slate-200/70 px-1.5 py-0.5 rounded text-slate-900">itms-services</code> manifest, and gives you a direct QR code and short install link.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="/dashboard"
                  className="px-5 py-3 bg-[#0066FF] hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm rounded-lg transition inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Go to Dashboard &amp; Upload</span>
                </a>
                {!isPaidUser && (
                  <a
                    href="/premium"
                    className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm rounded-lg border border-slate-300 transition"
                  >
                    View Lifetime Plan
                  </a>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-6 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">iOS .IPA</span>
                  <span className="text-slate-500">Ad-Hoc &amp; Enterprise OTA</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Android .APK</span>
                  <span className="text-slate-500">Direct S3 Package Stream</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Short URLs</span>
                  <span className="text-slate-500 font-mono">/d/[slug] + QR</span>
                </div>
              </div>
            </div>

            {/* Right Column: Working Local Binary Inspector */}
            <div className="lg:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Test Binary Inspector (.IPA / .APK)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Client-side • 0 bytes uploaded</span>
                </div>

                <div className="p-6">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) handleInspectFile(e.dataTransfer.files[0]);
                    }}
                    onClick={() => inspectorInputRef.current?.click()}
                    className="border border-dashed border-slate-300 hover:border-[#0066FF] bg-[#FAFAFA] hover:bg-blue-50/20 rounded-lg p-8 text-center cursor-pointer transition space-y-2.5"
                  >
                    <input
                      ref={inspectorInputRef}
                      type="file"
                      accept=".ipa,.apk"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleInspectFile(e.target.files[0]);
                      }}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
                      {isInspecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {inspectedFile ? inspectedFile.name : 'Select or drop an .ipa or .apk file to inspect'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Reads Info.plist or AndroidManifest.xml directly in your browser
                      </p>
                    </div>
                  </div>

                  {inspectedData && (
                    <div className="mt-4 border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          {inspectedData.icon ? (
                            <img
                              src={inspectedData.icon}
                              alt=""
                              className="w-10 h-10 rounded-lg border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                              {inspectedData.platform === 'ios' ? (
                                <Apple className="w-5 h-5" />
                              ) : (
                                <Smartphone className="w-5 h-5" />
                              )}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{inspectedData.title}</p>
                            <p className="text-xs font-mono text-slate-500 truncate">{inspectedData.bundleId}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-white border border-slate-200 rounded text-slate-700">
                          {inspectedData.platform}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block">Version</span>
                          <span className="font-mono font-semibold text-slate-800">{inspectedData.version}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block">Build</span>
                          <span className="font-mono font-semibold text-slate-800">{inspectedData.buildNumber}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block">File Size</span>
                          <span className="font-mono font-semibold text-slate-800">{inspectedData.sizeMB} MB</span>
                        </div>
                      </div>

                      <div className="pt-1">
                        <a
                          href="/dashboard"
                          className="w-full py-2 px-3 bg-[#0066FF] hover:bg-blue-600 text-white font-semibold text-xs rounded-md text-center block transition"
                        >
                          Upload &amp; Generate Install Link in Dashboard &rarr;
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. HOW IT WORKS (CLEAN 3-COLUMN BORDER GRID — NO AI CARDS) */}
        <section id="workflow" className="border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="mb-10">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                How DropOnAir Works
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Three steps from compiled binary to over-the-air device installation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 border border-slate-200 rounded-xl divide-y md:divide-y-0 md:divide-x divide-slate-200">
              <div className="p-6 space-y-2">
                <span className="text-xs font-mono font-bold text-[#0066FF]">01</span>
                <h3 className="text-sm font-bold text-slate-900">Select .IPA or .APK Binary</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Drop your build file in the dashboard. Version string, build number, bundle identifier, and minimum OS version are parsed automatically before upload begins.
                </p>
              </div>

              <div className="p-6 space-y-2">
                <span className="text-xs font-mono font-bold text-[#0066FF]">02</span>
                <h3 className="text-sm font-bold text-slate-900">Direct S3 &amp; Manifest Generation</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Files upload directly to AWS S3 with 5MB multipart chunking. For iOS builds, DropOnAir generates and hosts the HTTPS <code className="font-mono">manifest.plist</code> required by Safari.
                </p>
              </div>

              <div className="p-6 space-y-2">
                <span className="text-xs font-mono font-bold text-[#0066FF]">03</span>
                <h3 className="text-sm font-bold text-slate-900">Share QR or Short Link</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Send <code className="font-mono">droponair.saasscale.in/d/slug</code> or display the QR code. Testers scan with their device camera to install immediately without cables.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. TECHNICAL SPECIFICATIONS TABLE */}
        <section id="specs" className="border-b border-slate-200 bg-[#FAFAFA] py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Platform Specifications
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Supported binary formats, protocols, and environment channels.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <th className="py-3.5 px-5 font-semibold text-slate-700 bg-slate-50 w-1/3 sm:w-1/4">
                      iOS Distribution
                    </th>
                    <td className="py-3.5 px-5 text-slate-600">
                      <code className="font-mono text-slate-900">.ipa</code> via <code className="font-mono text-slate-900">itms-services://?action=download-manifest</code> over HTTPS
                    </td>
                  </tr>
                  <tr>
                    <th className="py-3.5 px-5 font-semibold text-slate-700 bg-slate-50">
                      Android Distribution
                    </th>
                    <td className="py-3.5 px-5 text-slate-600">
                      <code className="font-mono text-slate-900">.apk</code> direct binary download with package &amp; SDK version inspection
                    </td>
                  </tr>
                  <tr>
                    <th className="py-3.5 px-5 font-semibold text-slate-700 bg-slate-50">
                      Release Channels
                    </th>
                    <td className="py-3.5 px-5 text-slate-600 font-mono">
                      DEV, UAT, STAGING, PROD
                    </td>
                  </tr>
                  <tr>
                    <th className="py-3.5 px-5 font-semibold text-slate-700 bg-slate-50">
                      Public Install URLs
                    </th>
                    <td className="py-3.5 px-5 text-slate-600 font-mono">
                      https://droponair.saasscale.in/download/[slug] &amp; /d/[slug]
                    </td>
                  </tr>
                  <tr>
                    <th className="py-3.5 px-5 font-semibold text-slate-700 bg-slate-50">
                      Upload Architecture
                    </th>
                    <td className="py-3.5 px-5 text-slate-600">
                      Presigned AWS S3 PUT with automatic 5MB multipart fallback for large binaries
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. STRAIGHTFORWARD PRICING COMPARISON */}
        <section id="pricing" className="border-b border-slate-200 py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Retention &amp; Plans
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Start distributing for free or upgrade for permanent build retention.
                </p>
              </div>
              {!isPaidUser && (
                <a
                  href="/premium"
                  className="text-xs font-semibold text-[#0066FF] hover:underline"
                >
                  Contact for Lifetime Pro or Custom Setup &rarr;
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Free Tier */}
              <div className="border border-slate-200 rounded-xl p-6 flex flex-col justify-between bg-white">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">Standard (Free)</h3>
                      <p className="text-xs text-slate-500 mt-0.5">For temporary QA &amp; test cycles</p>
                    </div>
                    <span className="text-xl font-bold text-slate-900">$0</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-slate-900 shrink-0" />
                      <span>iOS (.IPA) &amp; Android (.APK) OTA hosting</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-slate-900 shrink-0" />
                      <span><strong>20-day</strong> build retention per release</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-slate-900 shrink-0" />
                      <span>Automatic QR code &amp; short link generation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-slate-900 shrink-0" />
                      <span>Ad-supported public download page</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <a
                    href="/dashboard"
                    className="w-full py-2.5 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs text-center block transition"
                  >
                    Start Uploading Free
                  </a>
                </div>
              </div>

              {/* Lifetime Pro */}
              <div className="border border-slate-900 rounded-xl p-6 flex flex-col justify-between bg-white">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">Lifetime Pro</h3>
                      <p className="text-xs text-slate-500 mt-0.5">For teams, agencies &amp; production releases</p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-900 text-white">
                      PERMANENT
                    </span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#0066FF] shrink-0" />
                      <span><strong>Permanent build storage</strong> (never expires)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#0066FF] shrink-0" />
                      <span><strong>Unlimited</strong> app workspaces &amp; releases</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#0066FF] shrink-0" />
                      <span><strong>Ad-free</strong> public install pages for your testers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#0066FF] shrink-0" />
                      <span>Direct engineering support from Ashish</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  {isPaidUser ? (
                    <span className="w-full py-2.5 px-4 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs text-center block">
                      Lifetime Pro Active on Your Account
                    </span>
                  ) : (
                    <a
                      href="/premium"
                      className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-black text-white font-semibold text-xs text-center block transition"
                    >
                      Buy Premium / Contact Ashish
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FAQ + AD PLACEMENT */}
        <section id="faq" className="py-16 px-6 max-w-3xl mx-auto space-y-8">
          {!isPaidUser && (
            <GoogleAdUnit
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LANDING || '3333333333'}
              label="Sponsored"
              className="max-w-3xl"
            />
          )}

          <div className="space-y-4">
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: faqs.map((f) => ({
                    '@type': 'Question',
                    name: f.q,
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: f.a,
                    },
                  })),
                }),
              }}
            />
            <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-200 bg-white">
              {faqs.map((item, idx) => (
                <div key={idx}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-5 py-4 text-left text-xs sm:text-sm font-semibold text-slate-900 flex items-center justify-between hover:bg-slate-50 transition"
                  >
                    <span>{item.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 7. CLEAN FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="DropOnAir" className="w-6 h-6 object-contain" />
            <span className="font-bold text-slate-900">DropOnAir</span>
            <span>• https://droponair.saasscale.in</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 font-medium">
            <a href="/dashboard" className="hover:text-slate-900 transition">Dashboard</a>
            {!isPaidUser && (
              <a href="/premium" className="hover:text-slate-900 transition">Buy Premium</a>
            )}
            <a href="/login" className="hover:text-slate-900 transition">Sign In</a>
            <a href="mailto:ashishrohilla510@gmail.com" className="text-slate-700 hover:text-[#0066FF] transition">
              ashishrohilla510@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
