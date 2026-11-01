'use client';

import React, { useState, useEffect } from 'react';
import { 
  Apple, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Share2, 
  Copy, 
  Check, 
  ShieldCheck, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info
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
  const [showInstructions, setShowInstructions] = useState(false);
  const [installCount, setInstallCount] = useState(release.download_count || 0);

  // Check expiration status
  const isExpired = release.expires_at ? new Date(release.expires_at) < new Date() : false;

  // Calculate days remaining if not expired and has expires_at
  const daysRemaining = release.expires_at
    ? Math.max(0, Math.ceil((new Date(release.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  useEffect(() => {
    // Detect user OS
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
  // Note: iOS requires HTTPS for manifest!
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
      // Trigger itms-services
      window.location.href = iosOtaUrl;
    } else {
      // Android direct APK download
      window.location.href = release.file_url;
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const envBadgeColors: Record<string, string> = {
    DEV: 'bg-purple-100 text-purple-700 border-purple-200',
    UAT: 'bg-amber-100 text-amber-700 border-amber-200',
    PROD: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    STAGING: 'bg-sky-100 text-sky-700 border-sky-200',
  };

  const fileSizeMB = release.file_size ? (release.file_size / (1024 * 1024)).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Brand Bar */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 font-bold text-lg text-white group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              <Download className="w-4 h-4" />
            </div>
            <span>AppDrop</span>
          </a>

          <div className="flex items-center gap-3">
            <button
              onClick={copyLink}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700/80 transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Share Link'}
            </button>
            <a
              href="/dashboard"
              className="px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 rounded-lg transition"
            >
              Dashboard &rarr;
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-xl bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Expired State */}
          {isExpired ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">This Release Has Expired</h2>
                <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
                  This build was uploaded under the Free tier, which retains builds for 20 days.
                  The developer can upgrade to the Paid plan for permanent, lifetime storage.
                </p>
              </div>
              <div className="pt-4">
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition"
                >
                  Go to Dashboard & Upload New Build
                </a>
              </div>
            </div>
          ) : (
            /* Active Release Details */
            <div className="space-y-6 relative z-10">
              {/* App Header Info */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700/80 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                  {release.platform === 'ios' ? (
                    <Apple className="w-9 h-9 text-slate-200" />
                  ) : (
                    <Smartphone className="w-9 h-9 text-emerald-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${envBadgeColors[release.environment] || 'bg-slate-800 text-slate-300'}`}>
                      {release.environment}
                    </span>
                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-800 border border-slate-700 text-slate-300 uppercase tracking-wider">
                      {release.platform}
                    </span>
                    {release.is_paid ? (
                      <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ⭐ Lifetime
                      </span>
                    ) : daysRemaining !== null ? (
                      <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {daysRemaining} days left
                      </span>
                    ) : null}
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                    {release.title}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Version <span className="text-slate-200 font-medium">{release.version}</span> (Build {release.build_number})
                  </p>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Size</span>
                  <span className="font-semibold text-slate-300">{fileSizeMB ? `${fileSizeMB} MB` : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Bundle ID</span>
                  <span className="font-semibold text-slate-300 truncate block max-w-[110px]" title={release.bundle_id}>
                    {release.bundle_id || 'Standard'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Min OS</span>
                  <span className="font-semibold text-slate-300">{release.min_os_version || 'Any'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Installs</span>
                  <span className="font-semibold text-slate-300">{installCount}</span>
                </div>
              </div>

              {/* Release Notes */}
              {release.release_notes && (
                <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800/60 text-xs">
                  <span className="text-slate-400 font-semibold block mb-1">Release Notes:</span>
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{release.release_notes}</p>
                </div>
              )}

              {/* Action Buttons & Device Adaptation */}
              <div className="space-y-3 pt-2">
                {release.platform === 'ios' ? (
                  <>
                    {/* iOS Primary Install Button */}
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-semibold text-base rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2.5"
                    >
                      <Apple className="w-5 h-5" />
                      <span>Install App on iOS</span>
                    </button>

                    {/* Secondary Raw IPA Download */}
                    <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                      <span>Need raw file for sideloading?</span>
                      <a
                        href={release.file_url}
                        onClick={trackDownload}
                        download
                        className="text-blue-400 hover:text-blue-300 underline font-medium inline-flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download .IPA
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Android Primary Download APK Button */}
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-semibold text-base rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2.5"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download & Install APK</span>
                    </button>

                    <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                      <span>Direct S3 Package</span>
                      <a
                        href={release.file_url}
                        onClick={trackDownload}
                        download
                        className="text-emerald-400 hover:text-emerald-300 underline font-medium inline-flex items-center gap-1"
                      >
                        Direct Link
                      </a>
                    </div>
                  </>
                )}
              </div>

              {/* QR Code Section (Especially convenient on Desktop) */}
              <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                <p className="text-xs font-semibold text-slate-300 mb-3">
                  Scan to Install on Mobile Device
                </p>
                <div className="inline-block p-1 bg-white rounded-2xl shadow-md">
                  <QRCodeViewer
                    url={publicUrl}
                    title={release.title}
                    size={160}
                    showActions={false}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Open Camera on iPhone or Android to scan and install
                </p>
              </div>

              {/* Step-by-Step Installation Instructions Accordion */}
              <div className="mt-4 border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/40">
                <button
                  type="button"
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="w-full px-4 py-3 text-xs font-medium text-slate-300 hover:text-white flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    How to install this build on your device
                  </span>
                  {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showInstructions && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-300 space-y-2 border-t border-slate-800">
                    {release.platform === 'ios' ? (
                      <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                        <li>Tap <strong>Install App on iOS</strong> above using Safari browser.</li>
                        <li>When prompted with <em>&quot;Open this page in iTunes?&quot;</em> or <em>&quot;Install&quot;</em>, tap <strong>Install</strong>.</li>
                        <li>Go to your device Home Screen to observe app installation progress.</li>
                        <li>
                          If you see &quot;Untrusted Enterprise Developer&quot; on first launch:
                          <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5 text-slate-400">
                            <li>Open <strong>Settings</strong> &rarr; <strong>General</strong></li>
                            <li>Tap <strong>VPN &amp; Device Management</strong></li>
                            <li>Select the Developer Certificate and tap <strong>Trust</strong></li>
                          </ul>
                        </li>
                        <li>Note: For Ad-Hoc builds, your device UDID must be included in the provisioning profile.</li>
                      </ol>
                    ) : (
                      <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                        <li>Tap <strong>Download &amp; Install APK</strong> above.</li>
                        <li>Once downloaded, open the APK file from your notifications or Downloads folder.</li>
                        <li>If prompted, allow <strong>Install unknown apps</strong> for your browser.</li>
                        <li>Tap <strong>Install</strong> to complete installation.</li>
                      </ol>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-800/60">
        <p>AppDrop • Secure OTA Mobile App Testing &amp; Distribution</p>
      </footer>
    </div>
  );
}

