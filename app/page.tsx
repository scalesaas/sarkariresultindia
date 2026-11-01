'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Upload, 
  Smartphone, 
  Apple, 
  QrCode, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  Layers,
  ChevronRight,
  Globe
} from 'lucide-react';
import CreateReleasePanel from '@/components/CreateReleasePanel';
import { createBrowserClient } from '@supabase/ssr';

export default function HomePage() {
  const [showUploader, setShowUploader] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGoogleLogin = () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-white group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition">
              <Download className="w-5 h-5" />
            </div>
            <span className="tracking-tight">AppDrop</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Dashboard
            </Link>
            <button
              onClick={handleGoogleLogin}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-900 rounded-xl shadow-sm transition"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16 w-full flex flex-col items-center text-center">
        {/* Top Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>The Next-Gen Diawi &amp; Apps on Air Alternative</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-3xl leading-[1.15]">
          Effortless <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">IPA &amp; APK</span> Testing &amp; Distribution
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Upload iOS .IPA or Android .APK builds to AWS S3 storage. Generate instantaneous Over-The-Air install links, scannable QR codes, and organize environments (DEV, UAT, PROD) in one place.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition active:scale-95"
          >
            <span>Open Release Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => setShowUploader(true)}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm rounded-2xl transition"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Quick Upload Build</span>
          </button>
        </div>

        {/* Embedded Upload Panel (if toggled or directly accessible) */}
        {showUploader && (
          <div className="mt-10 w-full max-w-xl text-left animate-in fade-in zoom-in-95 duration-200">
            <CreateReleasePanel
              onClose={() => setShowUploader(false)}
              onReleaseCreated={(rel) => {
                window.location.href = `/download/${rel.slug}`;
              }}
            />
          </div>
        )}

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          {/* Card 1: OTA iOS Installation */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white mb-4">
              <Apple className="w-6 h-6 text-slate-200" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">iOS OTA In-Device Install</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Install ad-hoc and enterprise .IPA builds directly onto iPhones and iPads via Apple&apos;s wireless manifest protocol without plugging in cables.
            </p>
          </div>

          {/* Card 2: Environment Separation */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white mb-4">
              <Layers className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">DEV, UAT &amp; PROD Releases</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Organize builds by environment on the right panel. Keep historical releases separated for QA, clients, and staging stakeholders.
            </p>
          </div>

          {/* Card 3: Free vs Lifetime Retention */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white mb-4">
              <Clock className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">20-Day Free &amp; Lifetime Pro</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Free users enjoy 20-day retention on every build. Upgrading to a paid account grants permanent, lifetime storage powered by AWS S3.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-20 w-full max-w-4xl text-left">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            How Testing &amp; Distribution Works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
              <div className="text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">Step 1</div>
              <h4 className="font-semibold text-white mb-1.5">Drop .IPA or .APK</h4>
              <p className="text-xs text-slate-400">
                Upload your mobile binary directly to AWS S3 via presigned URLs without file size limitations.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
              <div className="text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">Step 2</div>
              <h4 className="font-semibold text-white mb-1.5">Tag Environment</h4>
              <p className="text-xs text-slate-400">
                Assign to DEV, UAT, or PROD. Provide changelog, bundle ID, and build version for your testers.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
              <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">Step 3</div>
              <h4 className="font-semibold text-white mb-1.5">Scan &amp; Install</h4>
              <p className="text-xs text-slate-400">
                Testers scan the live QR code or click the public link on iOS Safari or Android to install instantly.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} AppDrop. APK &amp; IPA Over-The-Air Distribution Platform.</p>
          <div className="flex gap-4">
            <Link href="/dashboard" className="hover:text-slate-300">Console</Link>
            <Link href="/login" className="hover:text-slate-300">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

