'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Apple,
  Smartphone,
  Download,
  QrCode,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Sparkles,
  LogOut,
  Cloud,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Box,
  Code,
  Settings,
  Loader2,
  FolderPlus,
  Link2,
  Terminal,
  FileCode,
  ShieldCheck,
  Mail,
  BarChart3,
  Globe,
  Layers,
} from 'lucide-react';
import CreateReleasePanel from '@/components/CreateReleasePanel';
import CreateAppModal from '@/components/CreateAppModal';
import QRModal from '@/components/QRModal';
import { createBrowserClient } from '@supabase/ssr';
import { authFetch } from '@/lib/auth-fetch';

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
  const [authChecking, setAuthChecking] = useState<boolean>(!initialUser);
  const [profile] = useState<any | null>(initialProfile);
  const [releases, setReleases] = useState<any[]>(initialReleases);
  const [apps, setApps] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isPaid, setIsPaid] = useState<boolean>(initialProfile?.is_paid || false);

  // Navigation View State: 'apps' (Your Apps overview), 'ota' (App details), 'docs' (CI/CD & Documentation)
  const [currentView, setCurrentView] = useState<'apps' | 'ota' | 'docs'>('apps');
  const [activeAppTab, setActiveAppTab] = useState<'ota' | 'applink' | 'cicd' | 'settings'>('ota');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isAppDropdownOpen, setIsAppDropdownOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnv, setSelectedEnv] = useState<string>('All');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string>('All');
  const [showArchived, setShowArchived] = useState(false);

  // Modals & Panels
  const [isCreateAppOpen, setIsCreateAppOpen] = useState(false);
  const [isCreateReleaseOpen, setIsCreateReleaseOpen] = useState(false);
  const [selectedReleaseForQR, setSelectedReleaseForQR] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTogglingPlan, setIsTogglingPlan] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch user's apps and releases
  const loadUserDashboardData = async () => {
    setIsLoadingData(true);
    try {
      const [appsRes, releasesRes] = await Promise.all([
        authFetch('/api/apps'),
        authFetch('/api/releases'),
      ]);

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApps(appsData.apps || []);
        if (selectedApp) {
          const updatedSelected = (appsData.apps || []).find((a: any) => a.id === selectedApp.id);
          if (updatedSelected) setSelectedApp(updatedSelected);
        }
      }

      if (releasesRes.ok) {
        const releasesData = await releasesRes.json();
        setReleases(releasesData.releases || []);
      }
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Enforce authentication before showing dashboard
  useEffect(() => {
    let mounted = true;

    async function verifyAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      const activeUser = session?.user || initialUser;

      if (!activeUser) {
        window.location.href = '/login';
        return;
      }

      if (mounted) {
        setUser(activeUser);
        if (!initialProfile) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('is_paid, plan_tier')
            .eq('id', activeUser.id)
            .maybeSingle();
          if (prof?.is_paid || prof?.plan_tier === 'paid') {
            setIsPaid(true);
          }
        }
        setAuthChecking(false);
        await loadUserDashboardData();
      }
    }

    verifyAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectApp = (app: any) => {
    setSelectedApp(app);
    setCurrentView('ota');
    setActiveAppTab('ota');
    setIsAppDropdownOpen(false);
  };

  const handleReleaseCreated = async (newRelease: any) => {
    setReleases((prev) => [newRelease, ...prev]);
    await loadUserDashboardData();
  };

  const handleAppCreated = (newApp: any) => {
    setApps((prev) => [newApp, ...prev]);
    handleSelectApp(newApp);
  };

  const handleDeleteApp = async (appId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Delete this app and all its releases?')) return;
    try {
      const res = await authFetch(`/api/apps?id=${appId}`, { method: 'DELETE' });
      if (res.ok) {
        setApps((prev) => prev.filter((a) => a.id !== appId));
        setReleases((prev) => prev.filter((r) => r.app_id !== appId));
        if (selectedApp?.id === appId) {
          setSelectedApp(null);
          setCurrentView('apps');
        }
      }
    } catch (err) {
      console.error('Delete app failed:', err);
    }
  };

  const handleCopyLink = (slug: string, id: string, useShortLink = false) => {
    const path = useShortLink ? `/d/${slug}` : `/download/${slug}`;
    const publicUrl = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteRelease = async (id: string) => {
    if (!confirm('Are you sure you want to delete this release?')) return;
    try {
      const res = await authFetch(`/api/releases?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReleases((prev) => prev.filter((r) => r.id !== id));
        await loadUserDashboardData();
      }
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const handleTogglePlan = async () => {
    setIsTogglingPlan(true);
    try {
      const res = await authFetch('/api/user/toggle-tier', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIsPaid(data.is_paid);
      }
    } catch (e) {
      console.error('Toggle plan error:', e);
    } finally {
      setIsTogglingPlan(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Verifying your DropOnAir session...</p>
      </div>
    );
  }

  // Filter releases for the currently selected app
  const appReleases = releases.filter((r) => {
    if (selectedApp && r.app_id && r.app_id !== selectedApp.id) return false;
    if (selectedEnv !== 'All' && r.environment !== selectedEnv) return false;
    if (selectedPlatformFilter !== 'All' && r.platform !== selectedPlatformFilter) return false;
    if (!showArchived && r.expires_at && new Date(r.expires_at) < new Date()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchVer = r.version?.toLowerCase().includes(q);
      const matchBuild = r.build_number?.toLowerCase().includes(q);
      const matchTitle = r.title?.toLowerCase().includes(q);
      const matchNotes = r.release_notes?.toLowerCase().includes(q);
      if (!matchVer && !matchBuild && !matchTitle && !matchNotes) return false;
    }
    return true;
  });

  const iosReleases = appReleases.filter((r) => r.platform === 'ios');
  const androidReleases = appReleases.filter((r) => r.platform === 'android');
  const latestIos = iosReleases[0];
  const latestAndroid = androidReleases[0];

  const totalIosDownloads = iosReleases.reduce((sum, r) => sum + (r.download_count || 0), 0);
  const totalAndroidDownloads = androidReleases.reduce((sum, r) => sum + (r.download_count || 0), 0);
  const globalDownloads = releases.reduce((sum, r) => sum + (r.download_count || 0), 0);

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently updated';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Updated just now';
    if (diffMins < 60) return `Last Updated ${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Last Updated ${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `Last Updated ${diffDays}d ago`;
    return 'Last Updated a month ago';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* 1. TOP NAVBAR (DropOnAir Header — Tools removed) */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40 px-6 py-2.5">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between">
          {/* Left: Logo & Nav items */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentView('apps')}
              className="flex items-center gap-2.5 group text-left"
            >
              <img src="/logo.png" alt="DropOnAir Logo" className="w-8 h-8 object-contain" />
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">DropOnAir</span>
            </button>

            <div className="h-4 w-px bg-slate-300" />

            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setCurrentView('apps')}
                className={`px-3 py-1.5 rounded-lg transition ${currentView === 'apps'
                    ? 'bg-blue-50 text-[#0066FF] font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                Apps
              </button>
              <button
                onClick={() => setCurrentView('docs')}
                className={`px-3 py-1.5 rounded-lg transition ${currentView === 'docs'
                    ? 'bg-blue-50 text-[#0066FF] font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                CI/CD &amp; Docs
              </button>
              <a
                href="/"
                className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition"
              >
                Landing Page
              </a>
              {!isPaid && (
                <a
                  href="/premium"
                  className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <span>Buy Premium</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-amber-400 font-bold flex items-center gap-0.5">
                    Pro <Sparkles className="w-2.5 h-2.5" />
                  </span>
                </a>
              )}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Buy Premium Button (only shown if not already paid) */}
            {!isPaid && (
              <a
                href="/premium"
                className="px-3.5 py-1.5 rounded-lg bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-bold hidden sm:flex items-center gap-1.5 transition shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Buy Premium</span>
              </a>
            )}

            <button
              onClick={handleTogglePlan}
              disabled={isTogglingPlan}
              className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Click to toggle Free (20 days) vs Paid (Lifetime) mode"
            >
              <span className="text-amber-400">👑</span>
              <span>{isPaid ? 'Pro Plan (Lifetime)' : 'Free Tier (20d)'}</span>
            </button>

            {/* Workspace Switcher */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white">
              <div className="w-4 h-4 rounded-full bg-blue-100 text-[#0066FF] flex items-center justify-center text-[10px] font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'W'}
              </div>
              <span className="max-w-[90px] truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Workspace'}
              </span>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 overflow-hidden">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.email?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      {currentView === 'docs' ? (
        /* CI/CD & API DOCUMENTATION VIEW */
        <main className="max-w-[1200px] w-full mx-auto px-6 py-8 flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => setCurrentView('apps')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0066FF] mb-2 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Apps</span>
              </button>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                <Terminal className="w-6 h-6 text-[#0066FF]" />
                <span>DropOnAir CI/CD &amp; OTA Documentation</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Automate your iOS (.IPA) and Android (.APK) deployments from GitHub Actions, Fastlane, or cURL.
              </p>
            </div>
            <a
              href="/premium"
              className="px-4 py-2 bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm transition inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Need Custom CI/CD Setup? Contact Ashish</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Apple className="w-4 h-4 text-[#0066FF]" />
                <span>How iOS Over-The-Air (OTA) Installation Works</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When you upload an <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">.ipa</code> build to DropOnAir, our engine automatically extracts <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">Info.plist</code> metadata (Bundle ID, Version, Build Number, App Icon) and generates an Apple-compliant XML property list manifest served over HTTPS via <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">itms-services://</code>.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                <li>Supports <strong>Ad-Hoc</strong>, <strong>Enterprise (In-House)</strong>, and <strong>Development</strong> signed IPAs.</li>
                <li>Make sure tester device UDIDs are included in your provisioning profile for Ad-Hoc builds.</li>
                <li>Manifest endpoint: <code className="font-mono text-[#0066FF]">/api/manifest/[slug]</code></li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>How Android APK Direct Distribution Works</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Android <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">.apk</code> packages are parsed directly in your browser for instant versionCode/versionName detection and uploaded via multi-part streams to AWS S3.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                <li>Zero file size bottlenecks with automatic 5MB S3 multipart chunking.</li>
                <li>Instant QR code and short link (<code className="font-mono text-[#0066FF]">/d/[slug]</code>) generation for QA teams.</li>
                <li>Real-time download counter incremented on every tester install.</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-400" />
                <span>Automated CI/CD Upload Example (cURL / GitHub Actions)</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">REST API</span>
            </div>
            <pre className="text-xs font-mono bg-slate-950 p-4 rounded-xl overflow-x-auto text-blue-300 leading-relaxed">
              {`# 1. Request Presigned S3 Upload URL
curl -X POST https://your-droponair-domain.com/api/upload/presign \\
  -H "Content-Type: application/json" \\
  -d '{"fileName": "app-release.ipa", "contentType": "application/octet-stream", "folder": "builds/uat"}'

# 2. Register Release in DropOnAir
curl -X POST https://your-droponair-domain.com/api/releases \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "My App",
    "platform": "ios",
    "environment": "UAT",
    "version": "1.2.0",
    "build_number": "42",
    "bundle_id": "com.company.myapp",
    "file_name": "app-release.ipa",
    "file_url": "https://s3.amazonaws.com/..."
  }'`}
            </pre>
          </div>
        </main>
      ) : currentView === 'apps' ? (
        /* SCREEN 1: "YOUR APPS" OVERVIEW */
        <main className="max-w-[1400px] w-full mx-auto px-6 py-8 flex-1 space-y-8">
          {/* Official DropOnAir Hero Banner */}
          <div className="rounded-3xl bg-[#05081c] border border-slate-800/80 shadow-xl overflow-hidden flex flex-col md:flex-row items-center justify-between">
            <div className="w-full md:w-2/5 max-w-[420px] shrink-0">
              <img
                src="/Droponairbanner.png"
                alt="Drop on Air Banner"
                className="w-full h-32 sm:h-36 object-cover object-center"
              />
            </div>
            <div className="p-5 sm:px-8 flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full border-t md:border-t-0 md:border-l border-slate-800/80">
              <div className="text-white space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
                  Over-The-Air Distribution Workspace
                </span>
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Deploy &amp; Share iOS (.IPA) and Android (.APK) Builds Instantly
                </h2>
              </div>
              <button
                onClick={() => setIsCreateReleaseOpen(true)}
                className="px-4 py-2.5 bg-[#0066FF] hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Quick Upload Build</span>
              </button>
            </div>
          </div>

          {/* Quick Analytics Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Apps</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{apps.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066FF] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Releases</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{releases.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Box className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total OTA Downloads</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{globalDownloads}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  {isPaid ? 'Lifetime Pro Active' : 'Free Plan (20d Retention)'}
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  {isPaid ? 'Unlimited permanent builds' : 'Upgrade for permanent storage'}
                </p>
              </div>
              {isPaid ? (
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              ) : (
                <a
                  href="/premium"
                  className="px-3 py-1.5 bg-[#0066FF] hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shrink-0"
                >
                  Upgrade
                </a>
              )}
            </div>
          </div>

          {/* Header row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 text-[#0066FF]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Apps</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {apps.length} of {isPaid ? '∞' : Math.max(apps.length, 1)} apps used on DropOnAir
              </p>
            </div>

            {/* Search & Create App Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0066FF]"
                />
              </div>

              <button
                onClick={() => setIsCreateAppOpen(true)}
                className="px-5 py-2 bg-[#0066FF] hover:bg-blue-600 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Create App</span>
              </button>
            </div>
          </div>

          {/* Apps Grid */}
          {isLoadingData ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#0066FF]" />
              <span className="text-xs font-medium">Loading your DropOnAir workspaces...</span>
            </div>
          ) : apps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto my-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center mx-auto">
                <FolderPlus className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No Apps Created Yet</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Create your first app workspace to start uploading and distributing iOS (.ipa) and Android (.apk) builds over-the-air.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => setIsCreateAppOpen(true)}
                  className="px-5 py-2.5 bg-[#0066FF] hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-sm transition inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First App</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {apps
                .filter((app) => app.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((app) => (
                  <div
                    key={app.id}
                    onClick={() => handleSelectApp(app)}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#0066FF] p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
                  >
                    <button
                      onClick={(e) => handleDeleteApp(app.id, e)}
                      className="absolute top-3.5 right-3.5 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                      title="Delete App"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-3.5 mb-6">
                      <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shadow-inner group-hover:scale-105 transition overflow-hidden shrink-0">
                        {app.icon_url ? (
                          <img src={app.icon_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-slate-400 rounded-sm transform rotate-45" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-[#0066FF] transition truncate">
                          {app.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">{formatTimeAgo(app.updated_at || app.created_at)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Releases</p>
                        <h4 className="text-lg font-bold text-slate-900 mt-0.5">{app.release_count || 0}</h4>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Downloads</p>
                        <h4 className="text-lg font-bold text-slate-900 mt-0.5">{app.download_count || 0}</h4>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </main>
      ) : (
        /* SCREEN 2: "OTA DISTRIBUTION" VIEW (AppSync & AppRemark removed) */
        <div className="max-w-[1500px] w-full mx-auto flex-1 flex flex-col md:flex-row">
          {/* LEFT SIDEBAR (Width: 260px) */}
          <aside className="w-full md:w-64 border-r border-slate-200 bg-white p-4 flex flex-col justify-between shrink-0">
            <div className="space-y-4">
              {/* App Switcher Dropdown */}
              <div className="relative">
                <div
                  onClick={() => setIsAppDropdownOpen(!isAppDropdownOpen)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition border border-slate-200/80 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 overflow-hidden">
                      {selectedApp?.icon_url ? (
                        <img src={selectedApp.icon_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        '▲'
                      )}
                    </div>
                    <span className="font-bold text-sm text-slate-900 truncate">{selectedApp?.name || 'Select App'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {isAppDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1.5 max-h-60 overflow-y-auto">
                    {apps.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => handleSelectApp(app)}
                        className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-50 ${selectedApp?.id === app.id ? 'text-[#0066FF] bg-blue-50/50' : 'text-slate-700'
                          }`}
                      >
                        <span className="truncate">{app.name}</span>
                        <span className="text-[10px] text-slate-400">{app.release_count || 0} builds</span>
                      </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                      <button
                        onClick={() => {
                          setIsAppDropdownOpen(false);
                          setIsCreateAppOpen(true);
                        }}
                        className="w-full py-1.5 text-xs font-bold text-[#0066FF] hover:bg-blue-50 rounded-lg flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Create New App
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Menu Items (AppSync & AppRemark removed) */}
              <nav className="space-y-1 text-xs font-semibold">
                <button
                  onClick={() => setActiveAppTab('ota')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${activeAppTab === 'ota'
                      ? 'bg-blue-50 text-[#0066FF] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <Box className={`w-4 h-4 ${activeAppTab === 'ota' ? 'text-[#0066FF]' : 'text-slate-400'}`} />
                  <span>OTA Distribution</span>
                </button>

                <button
                  onClick={() => setActiveAppTab('applink')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${activeAppTab === 'applink'
                      ? 'bg-blue-50 text-[#0066FF] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <Link2 className={`w-4 h-4 ${activeAppTab === 'applink' ? 'text-[#0066FF]' : 'text-slate-400'}`} />
                  <span>AppLinks &amp; QR</span>
                </button>

                <button
                  onClick={() => setActiveAppTab('cicd')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${activeAppTab === 'cicd'
                      ? 'bg-blue-50 text-[#0066FF] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <Terminal className={`w-4 h-4 ${activeAppTab === 'cicd' ? 'text-[#0066FF]' : 'text-slate-400'}`} />
                  <span>CI/CD Integration</span>
                </button>

                <button
                  onClick={() => setActiveAppTab('settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${activeAppTab === 'settings'
                      ? 'bg-blue-50 text-[#0066FF] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <Settings className={`w-4 h-4 ${activeAppTab === 'settings' ? 'text-[#0066FF]' : 'text-slate-400'}`} />
                  <span>App Settings</span>
                </button>
              </nav>
            </div>

            {/* Bottom Promo Card (Only shown if user is not already paid) */}
            {!isPaid && (
              <div className="mt-8 p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-left relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <img src="/logo.png" alt="DropOnAir" className="w-4 h-4 object-contain" />
                  <span className="text-[11px] font-bold text-slate-900">DropOnAir Pro</span>
                </div>
                <h5 className="font-bold text-xs text-slate-900 leading-snug">Lifetime Build Storage</h5>
                <p className="text-[10px] text-slate-500 mt-0.5">Remove the 20-day limit and unlock unlimited apps.</p>
                <a
                  href="/premium"
                  className="mt-2.5 inline-block px-3 py-1 bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-[10px] rounded-lg shadow-sm transition"
                >
                  Buy Premium &rarr;
                </a>
              </div>
            )}
          </aside>

          {/* MAIN APP TAB CONTENT AREA */}
          <main className="flex-1 p-6 md:p-8 space-y-8 overflow-x-hidden">
            {/* Breadcrumb */}
            <div>
              <button
                onClick={() => setCurrentView('apps')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0066FF] mb-3 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Apps</span>
              </button>

              {activeAppTab === 'ota' && (
                <>
                  <div className="flex items-center gap-2.5">
                    <Box className="w-6 h-6 text-[#0066FF]" />
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">OTA Distribution</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload and distribute iOS (.IPA) and Android (.APK) builds to your testers on DropOnAir.
                  </p>
                </>
              )}

              {activeAppTab === 'applink' && (
                <>
                  <div className="flex items-center gap-2.5">
                    <Link2 className="w-6 h-6 text-[#0066FF]" />
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AppLinks &amp; Short URLs</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Share short links (<code className="font-mono">/d/slug</code>) or direct install pages with your QA team.
                  </p>
                </>
              )}

              {activeAppTab === 'cicd' && (
                <>
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-6 h-6 text-[#0066FF]" />
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">CI/CD Automation</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Automate build deployments for <strong>{selectedApp?.name}</strong> directly from your pipeline.
                  </p>
                </>
              )}

              {activeAppTab === 'settings' && (
                <>
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-6 h-6 text-[#0066FF]" />
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">App Settings</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Workspace configuration and metadata for <strong>{selectedApp?.name}</strong>.
                  </p>
                </>
              )}
            </div>

            {activeAppTab === 'ota' && (
              <>
                {/* TWO PLATFORM SUMMARY CARDS (Side by side) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1: Android */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm min-h-[140px]">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base leading-tight">Android</h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {latestAndroid ? `Latest version v${latestAndroid.version}` : 'No releases yet'}
                          </p>
                        </div>
                      </div>

                      {latestAndroid && (
                        <a
                          href={`/download/${latestAndroid.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-1.5 bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm transition"
                        >
                          Download
                        </a>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      {latestAndroid ? (
                        <div className="flex items-center gap-8">
                          <div>
                            <span className="font-bold text-slate-900 text-base block">{androidReleases.length}</span>
                            <span className="text-slate-400 text-[11px]">Total Releases</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-base block">{totalAndroidDownloads}</span>
                            <span className="text-slate-400 text-[11px]">Total Downloads</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">No releases yet</span>
                      )}
                    </div>
                  </div>

                  {/* Card 2: iOS */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm min-h-[140px]">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                          <Apple className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base leading-tight">iOS</h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {latestIos ? `Latest version v${latestIos.version}` : 'No releases yet'}
                          </p>
                        </div>
                      </div>

                      {latestIos && (
                        <a
                          href={`/download/${latestIos.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-1.5 bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm transition"
                        >
                          Download
                        </a>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-8 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 text-base block">{iosReleases.length}</span>
                        <span className="text-slate-400 text-[11px]">Total Releases</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-base block">{totalIosDownloads}</span>
                        <span className="text-slate-400 text-[11px]">Total Downloads</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ALL RELEASES TABLE SECTION */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Header row with filters & + New Release button */}
                  <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <h3 className="font-bold text-slate-900 text-base">All Releases ({appReleases.length})</h3>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Search input */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Filter version, build, notes..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      {/* Show Expired Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none">
                        <input
                          type="checkbox"
                          checked={showArchived}
                          onChange={(e) => setShowArchived(e.target.checked)}
                          className="rounded border-slate-300 text-[#0066FF] focus:ring-blue-500 w-4 h-4"
                        />
                        <span>Show Expired</span>
                      </label>

                      {/* Platform Dropdown */}
                      <select
                        value={selectedPlatformFilter}
                        onChange={(e) => setSelectedPlatformFilter(e.target.value)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="All">All Platforms</option>
                        <option value="ios">iOS (.IPA)</option>
                        <option value="android">Android (.APK)</option>
                      </select>

                      {/* Environment Dropdown */}
                      <select
                        value={selectedEnv}
                        onChange={(e) => setSelectedEnv(e.target.value)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="All">All Envs</option>
                        <option value="DEV">DEV</option>
                        <option value="UAT">UAT</option>
                        <option value="PROD">PROD</option>
                        <option value="STAGING">STAGING</option>
                      </select>

                      {/* + New Release Button */}
                      <button
                        onClick={() => setIsCreateReleaseOpen(true)}
                        className="px-4 py-2 bg-[#0066FF] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>New Release</span>
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  {appReleases.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                      <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                        <Box className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        No releases found for {selectedApp?.name || 'this app'}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Click <strong>+ New Release</strong> to upload an .IPA or .APK build. Version and package info will be autofilled!
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                            <th className="py-3.5 px-6">Platform</th>
                            <th className="py-3.5 px-6">Environment</th>
                            <th className="py-3.5 px-6">Version</th>
                            <th className="py-3.5 px-6">Build</th>
                            <th className="py-3.5 px-6">Notes / Size</th>
                            <th className="py-3.5 px-6">Downloads</th>
                            <th className="py-3.5 px-6">Uploaded On</th>
                            <th className="py-3.5 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {appReleases.map((release) => {
                            const dateStr = new Date(release.created_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            });
                            const isCopied = copiedId === release.id;
                            const isShortCopied = copiedId === `short-${release.id}`;
                            const sizeMB = release.file_size ? `${(release.file_size / (1024 * 1024)).toFixed(1)} MB` : '';

                            return (
                              <tr key={release.id} className="hover:bg-slate-50/80 transition-colors">
                                {/* Platform */}
                                <td className="py-4 px-6">
                                  {release.platform === 'ios' ? (
                                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center" title="iOS (.IPA)">
                                      <Apple className="w-4 h-4" />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center" title="Android (.APK)">
                                      <Smartphone className="w-4 h-4" />
                                    </div>
                                  )}
                                </td>

                                {/* Environment */}
                                <td className="py-4 px-6">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${release.environment === 'PROD'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : release.environment === 'UAT'
                                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                                          : 'bg-purple-50 text-purple-700 border-purple-200'
                                      }`}
                                  >
                                    {release.environment || 'DEV'}
                                  </span>
                                </td>

                                {/* Version */}
                                <td className="py-4 px-6 font-bold text-slate-900">
                                  {release.version || '1.0.0'}
                                </td>

                                {/* Build */}
                                <td className="py-4 px-6">
                                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-medium border border-slate-200/80">
                                    {release.build_number || '1'}
                                  </span>
                                </td>

                                {/* Notes / Size */}
                                <td className="py-4 px-6 max-w-[200px]">
                                  <p className="text-slate-700 truncate font-medium" title={release.release_notes || ''}>
                                    {release.release_notes || 'Standard release'}
                                  </p>
                                  {sizeMB && <span className="text-[10px] text-slate-400">{sizeMB}</span>}
                                </td>

                                {/* Downloads */}
                                <td className="py-4 px-6 font-semibold text-slate-700">
                                  {release.download_count || 0}
                                </td>

                                {/* Uploaded On */}
                                <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">
                                  {dateStr}
                                </td>

                                {/* Actions */}
                                <td className="py-4 px-6 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Download raw file */}
                                    <a
                                      href={release.file_url}
                                      download
                                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                      title="Download Raw Build File"
                                    >
                                      <Download className="w-4 h-4" />
                                    </a>

                                    {/* iOS Manifest XML Link */}
                                    {release.platform === 'ios' && (
                                      <a
                                        href={`/api/manifest/${release.slug}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1.5 text-slate-400 hover:text-[#0066FF] hover:bg-slate-100 rounded-lg transition"
                                        title="View Apple OTA manifest.plist"
                                      >
                                        <FileCode className="w-4 h-4" />
                                      </a>
                                    )}

                                    {/* QR Code / Share */}
                                    <button
                                      onClick={() => setSelectedReleaseForQR(release)}
                                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                      title="View QR Code"
                                    >
                                      <QrCode className="w-4 h-4" />
                                    </button>

                                    {/* Copy Short Link (/d/slug) */}
                                    <button
                                      onClick={() => handleCopyLink(release.slug, `short-${release.id}`, true)}
                                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                      title="Copy Short Link (/d/slug)"
                                    >
                                      {isShortCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
                                    </button>

                                    {/* Copy Public Link */}
                                    <button
                                      onClick={() => handleCopyLink(release.slug, release.id)}
                                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                      title="Copy Public Install Link"
                                    >
                                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                    </button>

                                    {/* Open Install Page */}
                                    <a
                                      href={`/download/${release.slug}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 text-slate-400 hover:text-[#0066FF] hover:bg-slate-100 rounded-lg transition"
                                      title="Open Public Install Page"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>

                                    {/* Delete */}
                                    <button
                                      onClick={() => handleDeleteRelease(release.id)}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                      title="Delete Release"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination */}
                  <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs font-semibold text-slate-600">
                    <button className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-40" disabled>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="w-7 h-7 rounded-lg bg-[#0066FF] text-white flex items-center justify-center font-bold">
                      1
                    </span>
                    <button className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-40" disabled>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeAppTab === 'applink' && (
              /* APPLINKS & SHORT URL HUB */
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">Shareable Install Links for {selectedApp?.name}</h3>
                  <button
                    onClick={() => setIsCreateReleaseOpen(true)}
                    className="px-4 py-2 bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Build</span>
                  </button>
                </div>

                {appReleases.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">
                    No releases uploaded yet. Upload a build to generate instant short links and QR codes.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appReleases.map((rel) => (
                      <div key={rel.id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 hover:border-blue-300 transition">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0066FF] font-bold text-[10px] uppercase">
                              {rel.platform} • {rel.environment}
                            </span>
                            <span className="font-bold text-xs text-slate-900">
                              v{rel.version} ({rel.build_number})
                            </span>
                          </div>
                          <p className="font-mono text-xs text-slate-600 truncate">
                            {typeof window !== 'undefined' ? `${window.location.origin}/d/${rel.slug}` : `/d/${rel.slug}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleCopyLink(rel.slug, `tab-short-${rel.id}`, true)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                          >
                            {copiedId === `tab-short-${rel.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId === `tab-short-${rel.id}` ? 'Copied' : 'Copy /d/'}</span>
                          </button>
                          <button
                            onClick={() => setSelectedReleaseForQR(rel)}
                            className="p-2 bg-blue-50 text-[#0066FF] hover:bg-blue-100 rounded-xl transition"
                            title="Show QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeAppTab === 'cicd' && (
              /* CI/CD INTEGRATION TAB FOR THIS APP */
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Pipeline Configuration</h3>
                    <p className="text-xs text-slate-500">Use your App Workspace ID below when pushing builds from CI/CD.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500">App ID:</span>
                    <code className="text-xs font-mono font-bold text-slate-900">{selectedApp?.id}</code>
                  </div>
                </div>

                <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 space-y-3">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                    cURL / Pipeline Release Registration
                  </span>
                  <pre className="text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                    {`curl -X POST ${typeof window !== 'undefined' ? window.location.origin : 'https://droponair.com'}/api/releases \\
  -H "Content-Type: application/json" \\
  -d '{
    "app_id": "${selectedApp?.id || 'YOUR_APP_ID'}",
    "title": "${selectedApp?.name || 'My App'}",
    "platform": "ios",
    "environment": "UAT",
    "version": "1.0.0",
    "build_number": "1",
    "bundle_id": "${selectedApp?.bundle_id || 'com.company.app'}",
    "file_name": "build.ipa",
    "file_url": "https://your-s3-bucket.amazonaws.com/builds/uat/build.ipa"
  }'`}
                  </pre>
                </div>
              </div>
            )}

            {activeAppTab === 'settings' && (
              /* APP SETTINGS TAB */
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 max-w-2xl">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Workspace Details</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Metadata and configuration for {selectedApp?.name}.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">App Name</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedApp?.name}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Bundle / Package ID</span>
                    <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                      {selectedApp?.bundle_id || 'Auto-detected per release'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Total Releases</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{appReleases.length}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Total OTA Downloads</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      {totalIosDownloads + totalAndroidDownloads}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-red-600 text-sm">Danger Zone</h4>
                    <p className="text-xs text-slate-500">Permanently delete this app workspace and all associated releases.</p>
                  </div>
                  <button
                    onClick={() => selectedApp && handleDeleteApp(selectedApp.id)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete App</span>
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* FLOATING QUICK UPLOAD WIDGET (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-30 flex items-center gap-2">
        {!isPaid && (
          <a
            href="/premium"
            className="px-3.5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white shadow-xl text-xs font-bold hidden sm:flex items-center gap-1.5 transition-transform hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Buy Premium</span>
          </a>
        )}
        <button
          onClick={() => setIsCreateReleaseOpen(true)}
          className="w-12 h-12 rounded-full bg-[#0066FF] hover:bg-blue-600 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          title="Upload Release / New Build"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* CREATE APP MODAL */}
      <CreateAppModal
        isOpen={isCreateAppOpen}
        onClose={() => setIsCreateAppOpen(false)}
        onAppCreated={handleAppCreated}
      />

      {/* NEW RELEASE MODAL / DRAWER */}
      {isCreateReleaseOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full max-h-[92vh] flex flex-col">
            <CreateReleasePanel
              appId={selectedApp?.id}
              defaultAppName={selectedApp?.name || ''}
              isPaidUser={isPaid}
              onClose={() => setIsCreateReleaseOpen(false)}
              onReleaseCreated={(rel) => {
                handleReleaseCreated(rel);
              }}
            />
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {selectedReleaseForQR && (
        <QRModal
          release={selectedReleaseForQR}
          onClose={() => setSelectedReleaseForQR(null)}
        />
      )}
    </div>
  );
}
