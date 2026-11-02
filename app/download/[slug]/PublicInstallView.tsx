'use client';

import React, { useState, useEffect } from 'react';
import { 
  Apple, 
  Smartphone, 
  Download, 
  AlertTriangle, 
  Clock, 
  Copy, 
  Check, 
  ChevronDown,
  ChevronUp,
  Info,
  Cloud,
  Sparkles,
  Mail,
  Briefcase,
  ShieldCheck
} from 'lucide-react';
import QRCodeViewer from '@/components/QRCodeViewer';

interface PublicInstallViewProps {
  release: any;
  baseUrl: string;
}

export default function PublicInstallView({ release, baseUrl }: PublicInstallViewProps) {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [isInstalling, setIsInstalling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [installCount, setInstallCount] = useState(release.download_count || 0);

  // Check expiration status
  const isExpired = release.expires_at ? new Date(release.expires_at) < new Date() : false;

  // Calculate days remaining if not expired and has expires_at
  const daysRemaining = release.expires_at
    ? Math.max(0, Math.ceil((new Date(release.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
      if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
        setDeviceType('ios');
      } else if (/android/i.test(ua)) {
        setDeviceType('android');
      } else {
        setDeviceType('desktop');
      }
    }
  }, []);

  const publicUrl = typeof window !== 'undefined' 
    ? window.location.href 
    : `${baseUrl}/download/${release.slug}`;

  // iOS OTA Install URL: itms-services://?action=download-manifest&url=https://<domain>/api/manifest/<slug>
  const manifestUrl = `${baseUrl.replace('http://', 'https://')}/api/manifest/${release.slug}`;
  const iosOtaUrl = `itms-services://?action=download-manifest&url=${encodeURIComponent(manifestUrl)}`;

  const trackDownload = async () => {
    try {
      await fetch('/api/releases/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: release.slug }),
      });
      setInstallCount((prev: number) => prev + 1);
    } catch (e) {
      console.error('Download tracking failed:', e);
    }
  };

  const handleInstallClick = () => {
    trackDownload();
    setIsInstalling(true);

    if (release.platform === 'ios') {
      window.location.href = iosOtaUrl;
    } else {
      window.location.href = release.file_url;
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyDeveloperEmail = () => {
    navigator.clipboard.writeText('ashishrohilla510@gmail.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const envBadgeColors: Record<string, string> = {
    DEV: 'bg-purple-50 text-purple-700 border-purple-200',
    UAT: 'bg-amber-50 text-amber-700 border-amber-200',
    PROD: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    STAGING: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  const fileSizeMB = release.file_size ? (release.file_size / (1024 * 1024)).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between font-sans">
      {/* Top Brand Bar */}
      <header className="px-6 py-3.5 border-b border-slate-200/90 bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF] flex items-center justify-center text-white shadow-sm">
              <Cloud className="w-5 h-5 fill-white stroke-[#0066FF]" />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight block leading-none">
                AppsOnAir
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Built by Ashish
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={copyLink}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              {copied ? 'Link Copied' : 'Share Link'}
            </button>
            <a
              href="mailto:ashishrohilla510@gmail.com?subject=Hire%20Ashish%20/%20Premium%20App%20Distribution%20Inquiry"
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-sm transition hidden sm:inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Hire Ashish / Get Premium</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-4 space-y-6">
        {/* 1. CLEAN APP INSTALL CARD */}
        <div className="w-full max-w-xl bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {isExpired ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl border border-red-200 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">This Release Has Expired</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
                  This build was uploaded under the Free tier, which retains builds for 20 days.
                  Contact Ashish at <strong>ashishrohilla510@gmail.com</strong> for lifetime premium hosting.
                </p>
              </div>
              <div className="pt-3">
                <a
                  href="mailto:ashishrohilla510@gmail.com?subject=Upgrade%20to%20Lifetime%20Premium"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0066FF] hover:bg-blue-600 text-white font-semibold text-xs rounded-xl transition shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                  Contact for Lifetime Premium
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* App Header Info */}
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border flex items-center justify-center shadow-sm flex-shrink-0 ${
                  release.platform === 'ios'
                    ? 'bg-slate-100 border-slate-200 text-slate-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                }`}>
                  {release.platform === 'ios' ? (
                    <Apple className="w-9 h-9" />
                  ) : (
                    <Smartphone className="w-9 h-9" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${envBadgeColors[release.environment] || 'bg-slate-100 text-slate-700'}`}>
                      {release.environment}
                    </span>
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 border border-slate-200 text-slate-600 uppercase tracking-wider">
                      {release.platform}
                    </span>
                    {release.is_paid ? (
                      <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ⭐ Lifetime
                      </span>
                    ) : daysRemaining !== null ? (
                      <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {daysRemaining} days left
                      </span>
                    ) : null}
                  </div>

                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                    {release.title}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Version <span className="text-slate-900 font-bold">{release.version}</span> • Build <span className="font-mono font-semibold text-slate-700">{release.build_number}</span>
                  </p>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Size</span>
                  <span className="font-bold text-slate-800">{fileSizeMB ? `${fileSizeMB} MB` : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Bundle ID</span>
                  <span className="font-bold text-slate-800 truncate block max-w-[115px] font-mono text-[11px]" title={release.bundle_id}>
                    {release.bundle_id || 'Standard'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Min OS</span>
                  <span className="font-bold text-slate-800">{release.min_os_version || 'Any'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Downloads</span>
                  <span className="font-bold text-slate-800">{installCount}</span>
                </div>
              </div>

              {/* Release Notes */}
              {release.release_notes && (
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 text-xs">
                  <span className="text-slate-500 font-bold block mb-1">Release Notes:</span>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{release.release_notes}</p>
                </div>
              )}

              {/* Primary Install Button */}
              <div className="space-y-3 pt-1">
                {release.platform === 'ios' ? (
                  <>
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-4 px-6 bg-[#0066FF] hover:bg-blue-600 active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2.5"
                    >
                      <Apple className="w-5 h-5" />
                      <span>Install App on iOS (OTA)</span>
                    </button>

                    <div className="flex items-center justify-between text-xs px-1 text-slate-500">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Verified OTA Manifest
                      </span>
                      <a
                        href={release.file_url}
                        onClick={trackDownload}
                        download
                        className="text-[#0066FF] hover:underline font-bold inline-flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Raw .IPA
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-4 px-6 bg-[#0066FF] hover:bg-blue-600 active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2.5"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download &amp; Install APK</span>
                    </button>

                    <div className="flex items-center justify-between text-xs px-1 text-slate-500">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Direct Android Package
                      </span>
                      <a
                        href={release.file_url}
                        onClick={trackDownload}
                        download
                        className="text-[#0066FF] hover:underline font-bold inline-flex items-center gap-1"
                      >
                        Direct S3 Link
                      </a>
                    </div>
                  </>
                )}
              </div>

              {/* QR Code Section */}
              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs font-bold text-slate-700 mb-3">
                  Scan QR Code to Install on Mobile Device
                </p>
                <div className="inline-block">
                  <QRCodeViewer
                    url={publicUrl}
                    title={release.title}
                    size={155}
                    showActions={false}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Point your iPhone or Android camera at the QR code to open this page
                </p>
              </div>

              {/* Installation Instructions Accordion */}
              <div className="mt-4 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="w-full px-4 py-3 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#0066FF]" />
                    How to install this build on your device
                  </span>
                  {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showInstructions && (
                  <div className="px-4 pb-4 pt-2 text-xs text-slate-600 space-y-2 border-t border-slate-200/80">
                    {release.platform === 'ios' ? (
                      <ol className="list-decimal list-inside space-y-1.5">
                        <li>Tap <strong>Install App on iOS</strong> above using Safari browser.</li>
                        <li>When prompted with <em>&quot;Install&quot;</em>, tap <strong>Install</strong>.</li>
                        <li>Return to your Home Screen to watch the installation complete.</li>
                        <li>
                          If prompted with &quot;Untrusted Enterprise Developer&quot;:
                          <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5 text-slate-500">
                            <li>Go to <strong>Settings</strong> &rarr; <strong>General</strong> &rarr; <strong>VPN &amp; Device Management</strong></li>
                            <li>Select the Developer Profile and tap <strong>Trust</strong></li>
                          </ul>
                        </li>
                      </ol>
                    ) : (
                      <ol className="list-decimal list-inside space-y-1.5">
                        <li>Tap <strong>Download &amp; Install APK</strong> above.</li>
                        <li>Open the downloaded `.apk` file from your notifications.</li>
                        <li>Allow <strong>Install unknown apps</strong> if prompted, then tap <strong>Install</strong>.</li>
                      </ol>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. PROMOTIONAL / HIRE ME & PREMIUM ADVERTISEMENT CARD BY ASHISH */}
        <div className="w-full max-w-xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>BUILT BY ASHISH</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                Want a Premium Plan or Looking to Hire Me?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                Need lifetime app retention, custom white-label OTA distribution, or an experienced developer for your next iOS, Android, or Full-Stack project? Reach out directly:
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2 text-xs font-mono text-blue-300">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>ashishrohilla510@gmail.com</span>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
              <a
                href="mailto:ashishrohilla510@gmail.com?subject=Hire%20Ashish%20/%20Premium%20Plan%20Inquiry"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0066FF] hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition whitespace-nowrap"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Hire Me / Premium</span>
              </a>
              <button
                type="button"
                onClick={copyDeveloperEmail}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition whitespace-nowrap"
              >
                {emailCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{emailCopied ? 'Email Copied!' : 'Copy Email'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium">
            Built by <strong className="text-slate-800">Ashish</strong> • Over-The-Air APK &amp; IPA Distribution
          </p>
          <a
            href="mailto:ashishrohilla510@gmail.com"
            className="text-[#0066FF] hover:underline font-semibold"
          >
            Contact: ashishrohilla510@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}
