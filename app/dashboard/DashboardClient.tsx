'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Apple, 
  Smartphone, 
  Download, 
  QrCode, 
  Copy, 
  Check, 
  Trash2, 
  ExternalLink, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  LogOut, 
  Layers, 
  BarChart2, 
  HardDrive,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import CreateReleasePanel, { Environment } from '@/components/CreateReleasePanel';
import QRModal from '@/components/QRModal';
import { createBrowserClient } from '@supabase/ssr';

interface DashboardClientProps {
  initialUser: any | null;
  initialProfile: any | null;
  initialReleases: any[];
}

export default function DashboardClient({
  initialUser,
  initialProfile,
  initialReleases,
}: DashboardClientProps) {
  const [user, setUser] = useState<any | null>(initialUser);
  const [profile, setProfile] = useState<any | null>(initialProfile);
  const [releases, setReleases] = useState<any[]>(initialReleases);
  const [isPaid, setIsPaid] = useState<boolean>(initialProfile?.is_paid || false);

  // Filters
  const [selectedEnv, setSelectedEnv] = useState<string>('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // UI state
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [selectedReleaseForQR, setSelectedReleaseForQR] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTogglingPlan, setIsTogglingPlan] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Refresh releases
  const fetchReleases = async () => {
    try {
      const res = await fetch('/api/releases');
      const data = await res.json();
      if (data.releases) {
        setReleases(data.releases);
      }
    } catch (e) {
      console.error('Error refreshing releases:', e);
    }
  };

  const handleReleaseCreated = (newRelease: any) => {
    setReleases((prev) => [newRelease, ...prev]);
  };

  const handleDeleteRelease = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this release? The file will also be deleted from storage.')) {
      return;
    }

    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/releases?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReleases((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleCopyPublicLink = (slug: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const publicUrl = `${window.location.origin}/download/${slug}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTogglePlanTier = async () => {
    setIsTogglingPlan(true);
    try {
      const res = await fetch('/api/user/toggle-tier', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIsPaid(data.is_paid);
        if (profile) {
          setProfile({ ...profile, is_paid: data.is_paid, plan_tier: data.plan_tier });
        }
      }
    } catch (e) {
      console.error('Toggle plan error:', e);
    } finally {
      setIsTogglingPlan(false);
    }
  };

  const handleGoogleLogin = () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Filter releases
  const filteredReleases = releases.filter((release) => {
    if (selectedEnv !== 'ALL' && release.environment !== selectedEnv) return false;
    if (selectedPlatform !== 'ALL' && release.platform !== selectedPlatform) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = release.title?.toLowerCase().includes(q);
      const matchVersion = release.version?.toLowerCase().includes(q);
      const matchBundle = release.bundle_id?.toLowerCase().includes(q);
      if (!matchTitle && !matchVersion && !matchBundle) return false;
    }
    return true;
  });

  // Calculate statistics
  const totalReleases = releases.length;
  const iosCount = releases.filter((r) => r.platform === 'ios').length;
  const androidCount = releases.filter((r) => r.platform === 'android').length;
  const totalDownloads = releases.reduce((sum, r) => sum + (r.download_count || 0), 0);

  const envColors: Record<string, { bg: string; text: string; border: string }> = {
    DEV: { bg: 'bg-purple-100 text-purple-700', text: 'text-purple-700', border: 'border-purple-200' },
    UAT: { bg: 'bg-amber-100 text-amber-700', text: 'text-amber-700', border: 'border-amber-200' },
    PROD: { bg: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-700', border: 'border-emerald-200' },
    STAGING: { bg: 'bg-sky-100 text-sky-700', text: 'text-sky-700', border: 'border-sky-200' },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
                <Download className="w-4 h-4" />
              </div>
              <span className="tracking-tight">AppDrop</span>
            </a>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 rounded-md border border-slate-200">
              Distribution Console
            </span>
          </div>

          {/* User Controls & Plan Tier Toggle */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Plan Badge + Toggle button for testing */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 ${
                    isPaid ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {isPaid ? <Sparkles className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {isPaid ? 'Paid: Lifetime Retention' : 'Free: 20-Day Retention'}
                  </span>

                  <button
                    onClick={handleTogglePlanTier}
                    disabled={isTogglingPlan}
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition"
                    title="Toggle Plan Tier for testing"
                  >
                    Switch to {isPaid ? 'Free' : 'Paid'}
                  </button>
                </div>

                {/* User info & Signout */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}

                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-none truncate max-w-[120px]">
                      {user.email}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition"
              >
                Sign in with Google
              </button>
            )}

            {/* Toggle right sidebar button for smaller screens */}
            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        {/* Top Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Releases</p>
              <h4 className="text-xl font-bold text-slate-900">{totalReleases}</h4>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">iOS Builds (IPA)</p>
              <h4 className="text-xl font-bold text-slate-900">{iosCount}</h4>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Android Builds (APK)</p>
              <h4 className="text-xl font-bold text-slate-900">{androidCount}</h4>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Downloads</p>
              <h4 className="text-xl font-bold text-slate-900">{totalDownloads}</h4>
            </div>
          </div>
        </div>

        {/* Dashboard 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT / CENTER: Releases List & Management (Takes 7-8 columns on large screens) */}
          <div className={`${showRightPanel ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'} space-y-4`}>
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by app name, version..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Platform Filter Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                  {['ALL', 'ios', 'android'].map((plat) => (
                    <button
                      key={plat}
                      onClick={() => setSelectedPlatform(plat)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition uppercase ${
                        selectedPlatform === plat
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {plat === 'ALL' ? 'All Platforms' : plat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Environment Filter Buttons (DEV, UAT, PROD, STAGING) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
                  Environment:
                </span>
                {['ALL', 'DEV', 'UAT', 'PROD', 'STAGING'].map((env) => {
                  const isSelected = selectedEnv === env;
                  return (
                    <button
                      key={env}
                      onClick={() => setSelectedEnv(env)}
                      className={`px-3 py-1 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {env === 'ALL' ? 'All Envs' : env}
                    </button>
                  );
                })}

                <button
                  onClick={fetchReleases}
                  className="ml-auto p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                  title="Refresh list"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Releases List */}
            {filteredReleases.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">No releases found</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {searchQuery || selectedEnv !== 'ALL' || selectedPlatform !== 'ALL'
                      ? 'No builds match the selected filters. Try resetting the filters.'
                      : 'Use the release panel on the right to upload your first .IPA or .APK build for DEV, UAT, or PROD!'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReleases.map((release) => {
                  const isExpired = release.expires_at ? new Date(release.expires_at) < new Date() : false;
                  const daysLeft = release.expires_at
                    ? Math.max(0, Math.ceil((new Date(release.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                    : null;
                  const sizeMB = release.file_size ? (release.file_size / (1024 * 1024)).toFixed(1) : null;
                  const isCopied = copiedId === release.id;

                  return (
                    <div
                      key={release.id}
                      className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Left info */}
                      <div className="flex items-start gap-3.5">
                        <div className={`p-3 rounded-2xl flex-shrink-0 ${
                          release.platform === 'ios'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-emerald-600 text-white shadow-sm'
                        }`}>
                          {release.platform === 'ios' ? (
                            <Apple className="w-6 h-6" />
                          ) : (
                            <Smartphone className="w-6 h-6" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md border ${envColors[release.environment]?.bg || 'bg-slate-100'} ${envColors[release.environment]?.border || 'border-slate-200'}`}>
                              {release.environment}
                            </span>

                            <span className="text-xs font-semibold text-slate-800 truncate">
                              {release.title}
                            </span>

                            <span className="text-xs text-slate-500 font-mono">
                              v{release.version} ({release.build_number})
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span>{sizeMB ? `${sizeMB} MB` : 'Build file'}</span>
                            <span>•</span>
                            <span>{release.download_count || 0} installs</span>
                            <span>•</span>
                            {/* Retention Indicator */}
                            {release.is_paid ? (
                              <span className="text-emerald-700 font-medium flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-600" /> Lifetime
                              </span>
                            ) : isExpired ? (
                              <span className="text-red-600 font-semibold flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Expired
                              </span>
                            ) : daysLeft !== null ? (
                              <span className="text-amber-700 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {daysLeft} days left
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 self-end sm:self-center">
                        {/* Copy Public Link */}
                        <button
                          onClick={(e) => handleCopyPublicLink(release.slug, release.id, e)}
                          className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1"
                          title="Copy public download link"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                          <span>{isCopied ? 'Copied' : 'Link'}</span>
                        </button>

                        {/* View QR Code */}
                        <button
                          onClick={() => setSelectedReleaseForQR(release)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                          title="View QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* Open Public Install Page */}
                        <a
                          href={`/download/${release.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
                          title="Open Public Install Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {/* Direct Download S3 file */}
                        <a
                          href={release.file_url}
                          download
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                          title="Download Raw File"
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        {/* Delete Release */}
                        <button
                          onClick={(e) => handleDeleteRelease(release.id, e)}
                          disabled={isDeletingId === release.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                          title="Delete Release"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Create Release for Environment (DEV, UAT, PROD, STAGING) */}
          {showRightPanel && (
            <div className="lg:col-span-5 xl:col-span-4 sticky top-20">
              <CreateReleasePanel
                onReleaseCreated={handleReleaseCreated}
                isPaidUser={isPaid}
              />
            </div>
          )}
        </div>
      </main>

      {/* QR Code Modal */}
      {selectedReleaseForQR && (
        <QRModal
          release={selectedReleaseForQR}
          onClose={() => setSelectedReleaseForQR(null)}
        />
      )}
    </div>
  );
}

