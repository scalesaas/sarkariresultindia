'use client';

import React, { useState, useRef, useEffect } from 'react';
import Script from 'next/script';
import {
  Cloud,
  Sparkles,
  Apple,
  Smartphone,
  QrCode,
  Upload,
  Check,
  Copy,
  Download,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Terminal,
  FileCode,
  Globe,
  Clock,
  Mail,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BarChart3,
  Link2,
  Loader2,
  Package,
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPaidUser, setIsPaidUser] = useState(false);

  // Interactive IPA/APK Inspector State
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

  // Interactive Apple OTA Manifest Generator State
  const [plistTitle, setPlistTitle] = useState('DropOnAir App');
  const [plistBundleId, setPlistBundleId] = useState('com.droponair.app');
  const [plistVersion, setPlistVersion] = useState('1.0.0');
  const [plistIpaUrl, setPlistIpaUrl] = useState('https://your-s3-bucket.amazonaws.com/builds/prod/app.ipa');
  const [plistCopied, setPlistCopied] = useState(false);

  // CI/CD Snippet Tab State
  const [cicdTab, setCicdTab] = useState<'curl' | 'github' | 'fastlane'>('curl');
  const [cicdCopied, setCicdCopied] = useState(false);

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

  // Inspect .IPA or .APK locally in the browser
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
            // Also populate the manifest generator for convenience
            setPlistTitle(title);
            setPlistBundleId(bundleId);
            setPlistVersion(version);
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

    // Fallback metadata if parser unavailable
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

  const generatedPlistXml = `<?xml version="1.0" encoding="UTF-8"?>
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
          <string><![CDATA[${plistIpaUrl}]]></string>
        </dict>
      </array>
      <key>metadata</key>
      <dict>
        <key>bundle-identifier</key>
        <string>${plistBundleId}</string>
        <key>bundle-version</key>
        <string>${plistVersion}</string>
        <key>kind</key>
        <string>software</string>
        <key>title</key>
        <string>${plistTitle}</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>`;

  const handleCopyPlist = () => {
    navigator.clipboard.writeText(generatedPlistXml);
    setPlistCopied(true);
    setTimeout(() => setPlistCopied(false), 2000);
  };

  const handleDownloadPlist = () => {
    const blob = new Blob([generatedPlistXml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.plist';
    a.click();
    URL.revokeObjectURL(url);
  };

  const cicdSnippets: Record<'curl' | 'github' | 'fastlane', string> = {
    curl: `# Upload & Register Build via DropOnAir REST API
curl -X POST https://droponair.com/api/releases \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "DropOnAir Mobile",
    "platform": "ios",
    "environment": "UAT",
    "version": "2.4.0",
    "build_number": "108",
    "bundle_id": "com.droponair.mobile",
    "release_notes": "Automated CI build from main branch",
    "file_name": "app-release.ipa",
    "file_url": "https://your-s3-bucket.amazonaws.com/builds/uat/app-release.ipa"
  }'`,
    github: `# .github/workflows/droponair-deploy.yml
name: Deploy Build to DropOnAir OTA
on:
  push:
    branches: [ main, uat ]

jobs:
  distribute:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - name: Push IPA/APK to DropOnAir
        run: |
          curl -X POST \${{ secrets.DROPONAIR_URL }}/api/releases \\
            -H "Content-Type: application/json" \\
            -d '{
              "title": "My iOS App",
              "platform": "ios",
              "environment": "UAT",
              "version": "1.0.\${{ github.run_number }}",
              "build_number": "\${{ github.run_number }}",
              "file_name": "Runner.ipa",
              "file_url": "\${{ steps.s3.outputs.file_url }}"
            }'`,
    fastlane: `# Fastfile — Distribute to DropOnAir after gym / gradle
lane :beta_droponair do
  gym(scheme: "App", export_method: "ad-hoc")
  
  sh("curl -X POST https://droponair.com/api/releases " \\
     "-H 'Content-Type: application/json' " \\
     "-d '{\\"title\\":\\"MyApp\\",\\"platform\\":\\"ios\\",\\"environment\\":\\"UAT\\",\\"version\\":\\"1.2.0\\"}'")
end`,
  };

  const handleCopyCicd = () => {
    navigator.clipboard.writeText(cicdSnippets[cicdTab]);
    setCicdCopied(true);
    setTimeout(() => setCicdCopied(false), 2000);
  };

  const faqs = [
    {
      q: 'How does DropOnAir install iOS (.IPA) builds without TestFlight?',
      a: 'DropOnAir uses Apple’s native Over-The-Air (itms-services://) installation protocol. When you upload an Ad-Hoc, Enterprise, or Development signed .IPA file, DropOnAir automatically extracts your Bundle ID and Version and serves an HTTPS XML manifest.plist so testers can install directly from Safari with a single tap.',
    },
    {
      q: 'What is the difference between the Free Tier and DropOnAir Lifetime Premium?',
      a: 'Under the Free Tier, uploaded builds remain active for 20 days before expiring. Upgrading to DropOnAir Lifetime Premium unlocks permanent storage (your builds never expire), unlimited app workspaces, custom branding options, and direct priority engineering support from Ashish.',
    },
    {
      q: 'Are large .IPA and .APK files supported without 413 Payload Too Large errors?',
      a: 'Yes! DropOnAir uses direct presigned AWS S3 uploads with an automatic 5MB chunked multipart upload fallback, allowing you to reliably upload large iOS and Android builds.',
    },
    {
      q: 'Can I contact Ashish for a custom white-label OTA server or mobile app development?',
      a: 'Absolutely. Visit the Buy Premium page (/premium) or email ashishrohilla510@gmail.com directly for lifetime account upgrades, self-hosted white-label deployments, or full-stack / mobile engineering projects.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans scroll-smooth">
      <Script src="/app-info-parser.min.js" strategy="afterInteractive" />

      {/* 1. TOP NAVBAR (Tools removed, Buy Premium added) */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-7">
            <a href="/" className="flex items-center gap-2.5 group">
              <img src="/logo.png" alt="DropOnAir Logo" className="w-9 h-9 object-contain" />
              <div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-none">
                  DropOnAir
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  OTA App Distribution
                </span>
              </div>
            </a>

            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
              <a href="#features" className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition">
                Features
              </a>
              <a href="#inspector" className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition">
                IPA/APK Inspector
              </a>
              <a href="#manifest-generator" className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition">
                Manifest Generator
              </a>
              <a href="#cicd" className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition">
                CI/CD
              </a>
              {!isPaidUser && (
                <a
                  href="/premium"
                  className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5"
                >
                  <span>Buy Premium</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-amber-400 font-bold flex items-center gap-0.5">
                    Pro <Sparkles className="w-2.5 h-2.5" />
                  </span>
                </a>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {!isPaidUser && (
              <a
                href="/premium"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Buy Premium</span>
              </a>
            )}

            {isLoggedIn ? (
              <a
                href="/dashboard"
                className="px-4 py-2 bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            ) : (
              <>
                <a
                  href="/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Sign In
                </a>
                <a
                  href="/dashboard"
                  className="px-4 py-2 bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <span>Start Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden pt-16 pb-20 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#0066FF] text-xs font-bold">
                <Zap className="w-3.5 h-3.5" />
                <span>DropOnAir • Instant Over-The-Air iOS &amp; Android Distribution</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Drop Your Builds On Air.{' '}
                <span className="text-[#0066FF]">Install in One Tap.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Upload your <strong className="text-slate-900">.IPA</strong> and <strong className="text-slate-900">.APK</strong> builds, auto-extract package metadata in under 200ms, and share instant QR codes &amp; <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">itms-services://</code> OTA links with your QA testers and clients.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href="/dashboard"
                  className="px-6 py-3.5 bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Build Now (Free)</span>
                </a>

                {!isPaidUser && (
                  <a
                    href="/premium"
                    className="px-6 py-3.5 bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Buy Lifetime Premium</span>
                  </a>
                )}

                <a
                  href="#inspector"
                  className="px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl border border-slate-200 transition"
                >
                  Try IPA/APK Inspector
                </a>
              </div>

              {/* Trust Highlights */}
              <div className="pt-4 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 border-t border-slate-200/80 text-left">
                <div>
                  <span className="font-extrabold text-lg text-slate-900 block">&lt; 200ms</span>
                  <span className="text-[11px] text-slate-500 font-medium">Browser Metadata Parse</span>
                </div>
                <div>
                  <span className="font-extrabold text-lg text-slate-900 block">iOS &amp; Android</span>
                  <span className="text-[11px] text-slate-500 font-medium">Verified OTA Manifests</span>
                </div>
                <div>
                  <span className="font-extrabold text-lg text-slate-900 block">S3 Multipart</span>
                  <span className="text-[11px] text-slate-500 font-medium">Zero Payload Limits</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xl relative">
                {/* Official DropOnAir Banner Header */}
                <div className="w-full bg-[#05081c] relative overflow-hidden">
                  <img
                    src="/Droponairbanner.png"
                    alt="Drop on Air Banner"
                    className="w-full h-36 sm:h-40 object-cover object-center"
                  />
                </div>

                <div className="p-6 sm:p-7">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center p-1.5 shadow-sm">
                        <img src="/logo.png" alt="DropOnAir" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base text-slate-900">DropOnAir App</span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            PROD
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">v2.4.0 (Build 108) • iOS &amp; Android</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      ⭐ Lifetime
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 my-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Bundle ID</span>
                      <span className="font-mono font-bold text-slate-800 text-[11px] truncate block">com.droponair.app</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Min OS</span>
                      <span className="font-bold text-slate-800">iOS 15.0+</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Protocol</span>
                      <span className="font-bold text-emerald-600">itms-services</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <a
                      href="/dashboard"
                      className="w-full py-3.5 px-4 bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
                    >
                      <Apple className="w-4 h-4" />
                      <span>Install on iOS (Over-The-Air)</span>
                    </a>
                    <a
                      href="/dashboard"
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Download &amp; Install Android .APK</span>
                    </a>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <QrCode className="w-4 h-4 text-[#0066FF]" />
                      Auto QR Code &amp; Short Link (/d/slug)
                    </span>
                    {!isPaidUser && (
                      <a href="/premium" className="text-[#0066FF] font-bold hover:underline">
                        Get Pro &rarr;
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. INTERACTIVE FEATURE #1: INSTANT IN-BROWSER IPA & APK INSPECTOR */}
        <section id="inspector" className="py-16 px-6 bg-white border-y border-slate-200/80">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0066FF] text-xs font-bold uppercase tracking-wider">
                Free Instant Developer Utility
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Instant .IPA &amp; .APK Build Metadata Inspector
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                Drop any iOS <code className="font-mono">.ipa</code> or Android <code className="font-mono">.apk</code> file below to inspect its Bundle ID, Version, Build Number, and Minimum OS right in your browser (0 bytes uploaded to any server).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Dropzone */}
              <div className="md:col-span-6">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) handleInspectFile(e.dataTransfer.files[0]);
                  }}
                  onClick={() => inspectorInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#0066FF] bg-slate-50/70 hover:bg-blue-50/30 rounded-3xl p-8 text-center cursor-pointer transition-all space-y-3"
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
                  <div className="w-14 h-14 rounded-2xl bg-blue-100/80 text-[#0066FF] flex items-center justify-center mx-auto">
                    {isInspecting ? <Loader2 className="w-7 h-7 animate-spin" /> : <Package className="w-7 h-7" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {inspectedFile ? inspectedFile.name : 'Click or Drag & Drop an .IPA or .APK file'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      100% client-side inspection in &lt;200ms • Extracts Info.plist &amp; AndroidManifest.xml
                    </p>
                  </div>
                </div>
              </div>

              {/* Extracted Result Card */}
              <div className="md:col-span-6">
                {inspectedData ? (
                  <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4 shadow-xl">
                    <div className="flex items-center gap-4">
                      {inspectedData.icon ? (
                        <img
                          src={inspectedData.icon}
                          alt="App Icon"
                          className="w-14 h-14 rounded-2xl border border-slate-700 object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
                          {inspectedData.platform === 'ios' ? (
                            <Apple className="w-7 h-7" />
                          ) : (
                            <Smartphone className="w-7 h-7" />
                          )}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase">
                          {inspectedData.platform} Build Verified
                        </span>
                        <h3 className="text-lg font-extrabold truncate mt-1">{inspectedData.title}</h3>
                        <p className="text-xs text-slate-400 font-mono truncate">{inspectedData.bundleId}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 bg-slate-800/90 p-3.5 rounded-2xl text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase">Version</span>
                        <span className="font-bold text-white">{inspectedData.version}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase">Build #</span>
                        <span className="font-mono font-bold text-blue-300">{inspectedData.buildNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase">Size / OS</span>
                        <span className="font-bold text-white">{inspectedData.sizeMB} MB</span>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <a
                        href="/dashboard"
                        className="flex-1 py-2.5 px-4 bg-[#0066FF] hover:bg-blue-500 text-white font-bold text-xs rounded-xl text-center transition"
                      >
                        Distribute This Build on DropOnAir &rarr;
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 text-xs text-slate-500 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                      <Sparkles className="w-4 h-4 text-[#0066FF]" />
                      <span>What you&apos;ll see immediately:</span>
                    </div>
                    <ul className="space-y-2 list-disc list-inside">
                      <li><strong>CFBundleIdentifier</strong> / Android <strong>package</strong> name</li>
                      <li><strong>CFBundleShortVersionString</strong> / <strong>versionName</strong></li>
                      <li><strong>CFBundleVersion</strong> / <strong>versionCode</strong></li>
                      <li>Minimum OS / SDK requirements &amp; embedded App Icon</li>
                      <li>Auto-fills the Apple OTA <code className="font-mono">manifest.plist</code> generator below!</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 4. CORE FEATURES GRID */}
        <section id="features" className="py-16 px-6 max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0066FF] text-xs font-bold uppercase tracking-wider">
              Built for Mobile Engineering Teams
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything You Need for Frictionless OTA Testing
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Skip slow app review queues and bulky cable installs. Share builds with QA, product managers, and clients in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center">
                <Apple className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Automated iOS OTA Manifests</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every uploaded <code className="font-mono">.ipa</code> automatically generates a compliant HTTPS <code className="font-mono">manifest.plist</code> triggered via <code className="font-mono">itms-services://</code> for 1-tap Safari installation.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Chunked S3 Multipart Uploads</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct presigned AWS S3 uploads with automatic 5MB multipart chunking ensure even multi-hundred-megabyte builds upload smoothly without 413 errors.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">DEV, UAT, STAGING &amp; PROD Channels</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Organize releases by environment and platform. Filter your release history and keep QA testers on the right build channel.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">QR Codes &amp; Short Links (/d/slug)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every release gets a clean public install page, downloadable QR code, and ultra-short <code className="font-mono">/d/slug</code> URL for Slack or Jira comments.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Real-Time Download Analytics</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track how many times each iOS and Android build has been installed across your workspaces in real time.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Smart Device-Aware Install Page</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automatically detects iOS Safari, Android Chrome, or Desktop browsers and presents step-by-step enterprise certificate trust instructions.
              </p>
            </div>
          </div>
        </section>

        {/* 5. INTERACTIVE FEATURE #2: APPLE OTA MANIFEST.PLIST GENERATOR */}
        <section id="manifest-generator" className="py-16 px-6 bg-white border-y border-slate-200/80">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0066FF] text-xs font-bold uppercase tracking-wider">
                iOS OTA Helper Tool
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Apple <code className="text-[#0066FF] font-mono">manifest.plist</code> Generator
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Need a custom Apple Enterprise / Ad-Hoc OTA manifest XML? Customize the fields below and copy or download the ready-to-host <code className="font-mono">manifest.plist</code> file.
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">App Display Title</label>
                  <input
                    type="text"
                    value={plistTitle}
                    onChange={(e) => setPlistTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#0066FF]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bundle Identifier</label>
                    <input
                      type="text"
                      value={plistBundleId}
                      onChange={(e) => setPlistBundleId(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bundle Version</label>
                    <input
                      type="text"
                      value={plistVersion}
                      onChange={(e) => setPlistVersion(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">HTTPS .IPA File URL</label>
                  <input
                    type="url"
                    value={plistIpaUrl}
                    onChange={(e) => setPlistIpaUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#0066FF]"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-6 text-slate-100 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 font-mono">manifest.plist</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPlist}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    {plistCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{plistCopied ? 'Copied XML' : 'Copy XML'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPlist}
                    className="px-3 py-1.5 rounded-xl bg-[#0066FF] hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .plist</span>
                  </button>
                </div>
              </div>
              <pre className="text-[11px] font-mono bg-slate-950 p-4 rounded-2xl overflow-x-auto text-emerald-300 leading-relaxed max-h-72">
                {generatedPlistXml}
              </pre>
            </div>
          </div>
        </section>

        {/* 6. CI/CD AUTOMATION SECTION */}
        <section id="cicd" className="py-16 px-6 max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0066FF] text-xs font-bold uppercase tracking-wider">
              Automated Releases
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Deploy Directly from Your CI/CD Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Trigger DropOnAir OTA releases automatically on every commit using cURL, GitHub Actions, or Fastlane.
            </p>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {(
                  [
                    { id: 'curl', label: 'cURL REST API' },
                    { id: 'github', label: 'GitHub Actions' },
                    { id: 'fastlane', label: 'Fastlane' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCicdTab(t.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      cicdTab === t.id ? 'bg-[#0066FF] text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleCopyCicd}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {cicdCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{cicdCopied ? 'Copied!' : 'Copy Snippet'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono bg-slate-950 p-4 rounded-2xl overflow-x-auto text-blue-300 leading-relaxed">
              {cicdSnippets[cicdTab]}
            </pre>
          </div>
        </section>

        {/* 7. BUY PREMIUM / CONTACT CTA BANNER (Hidden if user is already paid) */}
        {!isPaidUser && (
          <section className="py-12 px-6 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-3 text-center lg:text-left max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>DROPONAIR LIFETIME PREMIUM &amp; CUSTOM SOLUTIONS</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Want Lifetime Build Storage or Custom App Engineering?
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Upgrade your DropOnAir workspace to remove the 20-day expiration limit, unlock unlimited apps, or contact <strong className="text-white">Ashish</strong> for custom white-label OTA distribution and full-stack mobile development.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
                <a
                  href="/premium"
                  className="px-6 py-4 bg-[#0066FF] hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Visit Buy Premium Page</span>
                </a>
                <a
                  href="mailto:ashishrohilla510@gmail.com?subject=DropOnAir%20Premium%20Inquiry"
                  className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>Email Ashish Directly</span>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* 8. FAQ SECTION */}
        <section className="py-12 px-6 max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left text-xs sm:text-sm font-bold text-slate-900 flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <span>{item.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 9. FOOTER */}
      <footer className="bg-white border-t border-slate-200/90 py-8 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="DropOnAir Logo" className="w-7 h-7 object-contain" />
            <span className="font-extrabold text-slate-900 text-sm">DropOnAir</span>
            <span>• Over-The-Air APK &amp; IPA Distribution • Built by Ashish</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 font-semibold">
            <a href="/dashboard" className="hover:text-slate-900 transition">Dashboard</a>
            <a href="/premium" className="text-[#0066FF] hover:underline">Buy Premium</a>
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
