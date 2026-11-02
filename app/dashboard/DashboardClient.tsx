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
  SlidersHorizontal,
  Box,
  RefreshCw,
  Bell,
  Code,
  Users,
  Settings,
  MessageSquare,
  Loader2,
  FolderPlus
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
  const [profile, setProfile] = useState<any | null>(initialProfile);
  const [releases, setReleases] = useState<any[]>(initialReleases);
  const [apps, setApps] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isPaid, setIsPaid] = useState<boolean>(initialProfile?.is_paid || false);

  // Navigation View State: 'apps' (Your Apps overview) vs 'ota' (App OTA Distribution details)
  const [currentView, setCurrentView] = useState<'apps' | 'ota'>('apps');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isAppDropdownOpen, setIsAppDropdownOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnv, setSelectedEnv] = useState<string>('All');
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
        // Update selectedApp reference if already selected
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

  const handleDeleteApp = async (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleCopyLink = (slug: string, id: string) => {
    const publicUrl = `${window.location.origin}/download/${slug}`;
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
        <p className="text-xs font-semibold text-slate-500">Verifying your session...</p>
      </div>
    );
  }

  // Filter releases for the currently selected app
  const appReleases = releases.filter((r) => {
    if (selectedApp && r.app_id && r.app_id !== selectedApp.id) return false;
    if (selectedEnv !== 'All' && r.environment !== selectedEnv) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchVer = r.version?.toLowerCase().includes(q);
      const matchBuild = r.build_number?.toLowerCase().includes(q);
      const matchTitle = r.title?.toLowerCase().includes(q);
      if (!matchVer && !matchBuild && !matchTitle) return false;
    }
    return true;
  });

  const iosReleases = appReleases.filter((r) => r.platform === 'ios');
  const androidReleases = appReleases.filter((r) => r.platform === 'android');
  const latestIos = iosReleases[0];
  const latestAndroid = androidReleases[0];

  const totalIosDownloads = iosReleases.reduce((sum, r) => sum + (r.download_count || 0), 0);
  const totalAndroidDownloads = androidReleases.reduce((sum, r) => sum + (r.download_count || 0), 0);

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
      {/* 1. TOP NAVBAR (AppsOnAir Exact Header) */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40 px-6 py-2.5">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between">
          {/* Left: Logo & Nav items */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentView('apps')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0066FF] flex items-center justify-center text-white shadow-sm">
                <Cloud className="w-5 h-5 fill-white stroke-[#0066FF]" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">AppsOnAir</span>
            </button>

            <div className="h-4 w-px bg-slate-300" />

            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setCurrentView('apps')}
                className={`px-3 py-1.5 rounded-lg transition ${currentView === 'apps'
                    ? 'bg-blue-50 text-[#0066FF] font-bold'
                    : 'hover:text-slate-900'
                  }`}
              >
                Apps
              </button>
              <span className="px-3 py-1.5 hover:text-slate-900 cursor-pointer">Team</span>
              <span className="px-3 py-1.5 hover:text-slate-900 cursor-pointer">Documentation</span>
              <span className="px-3 py-1.5 hover:text-slate-900 cursor-pointer flex items-center gap-1.5">
                Integrations
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-amber-400 font-bold flex items-center gap-0.5">
                  Pro <Sparkles className="w-2.5 h-2.5" />
                </span>
              </span>
              <span className="px-3 py-1.5 hover:text-slate-900 cursor-pointer flex items-center gap-1">
                Tools <ChevronDown className="w-3 h-3 text-slate-400" />
              </span>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Upgrade Button */}
            <button
              onClick={handleTogglePlan}
              disabled={isTogglingPlan}
              className="px-3.5 py-1.5 rounded-lg bg-[#111827] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Click to toggle Free (20 days) vs Paid (Lifetime) mode"
            >
              <span className="text-amber-400">👑</span>
              <span>{isPaid ? 'Pro Plan (Lifetime)' : 'Upgrade'}</span>
            </button>

            {/* Workspace Switcher */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white">
              <div className="w-4 h-4 rounded-full bg-blue-100 text-[#0066FF] flex items-center justify-center text-[10px] font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'W'}
              </div>
              <span className="max-w-[90px] truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Workspace'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
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
      {currentView === 'apps' ? (
        /* SCREEN 1: "YOUR APPS" OVERVIEW (Matches Image 1) */
        <main className="max-w-[1400px] w-full mx-auto px-6 py-8 flex-1">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
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
                {apps.length} of {isPaid ? '∞' : Math.max(apps.length, 1)} apps used
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
              <span className="text-xs font-medium">Loading your apps...</span>
            </div>
          ) : apps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto my-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center mx-auto">
                <FolderPlus className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No Apps Created Yet</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Create your first app workspace (e.g., <strong>poc</strong>) to start uploading and distributing iOS (.ipa) and Android (.apk) builds.
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
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Release</p>
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
        /* SCREEN 2: "OTA DISTRIBUTION" VIEW (Matches Image 2) */
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

              {/* Sidebar Menu Items */}
              <nav className="space-y-1 text-xs font-semibold">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50 text-[#0066FF] font-bold cursor-pointer">
                  <Box className="w-4 h-4 text-[#0066FF]" />
                  <span>OTA Distribution</span>
                </div>

                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition">
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                  <span>AppSync</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-auto" />
                </div>

                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition">
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span>AppLink</span>
                </div>

                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>AppRemark</span>
                </div>

                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <span>Push Notifications</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-[#0066FF] font-bold ml-auto">
                    Beta
                  </span>
                </div>

                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition">
                  <Code className="w-4 h-4 text-slate-400" />
                  <span>CodePush</span>
                </div>

                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Members</span>
                </div>

                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>App Settings</span>
                </div>
              </nav>
            </div>

            {/* Bottom Promo Card */}
            <div className="mt-8 p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-left relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="w-4 h-4 text-[#0066FF]" />
                <span className="text-[11px] font-bold text-slate-900">AppsOnAir</span>
              </div>
              <h5 className="font-bold text-xs text-slate-900 leading-snug">Push Notifications</h5>
              <p className="text-[10px] text-slate-500 mt-0.5">Targeted messaging for iOS and Android.</p>
              <button className="mt-2.5 px-3 py-1 bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-[10px] rounded-lg shadow-sm transition">
                Live now &rarr;
              </button>
            </div>
          </aside>

          {/* MAIN OTA CONTENT AREA */}
          <main className="flex-1 p-6 md:p-8 space-y-8 overflow-x-hidden">
            {/* Breadcrumb & Header */}
            <div>
              <button
                onClick={() => setCurrentView('apps')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0066FF] mb-3 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Apps</span>
              </button>

              <div className="flex items-center gap-2.5">
                <Box className="w-6 h-6 text-[#0066FF]" />
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">OTA Distribution</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">Upload and distribute app builds to your testers.</p>
            </div>

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
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="font-bold text-slate-900 text-base">All Releases</h3>

                <div className="flex items-center gap-3">
                  {/* Show Archived Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={showArchived}
                      onChange={(e) => setShowArchived(e.target.checked)}
                      className="rounded border-slate-300 text-[#0066FF] focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Show Archived</span>
                  </label>

                  {/* Environment Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedEnv}
                      onChange={(e) => setSelectedEnv(e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="All">All</option>
                      <option value="DEV">DEV</option>
                      <option value="UAT">UAT</option>
                      <option value="PROD">PROD</option>
                      <option value="STAGING">STAGING</option>
                    </select>
                  </div>

                  {/* + New Release Button (AppsOnAir style) */}
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
                  <h4 className="text-sm font-bold text-slate-800">No releases found for {selectedApp?.name || 'this app'}</h4>
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

                        return (
                          <tr key={release.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Platform */}
                            <td className="py-4 px-6">
                              {release.platform === 'ios' ? (
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center">
                                  <Apple className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                  <Smartphone className="w-4 h-4" />
                                </div>
                              )}
                            </td>

                            {/* Environment */}
                            <td className="py-4 px-6">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${release.environment === 'PROD'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : release.environment === 'UAT'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-purple-50 text-purple-700 border-purple-200'
                                }`}>
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
                                  title="Download Build File"
                                >
                                  <Cloud className="w-4 h-4" />
                                </a>

                                {/* QR Code / Share */}
                                <button
                                  onClick={() => setSelectedReleaseForQR(release)}
                                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                  title="View QR Code"
                                >
                                  <QrCode className="w-4 h-4" />
                                </button>

                                {/* Copy Public Link */}
                                <button
                                  onClick={() => handleCopyLink(release.slug, release.id)}
                                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                  title="Copy Public Link"
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
          </main>
        </div>
      )}

      {/* FLOATING ACTION / SUPPORT CHAT WIDGET (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsCreateReleaseOpen(true)}
          className="w-12 h-12 rounded-full bg-[#0066FF] hover:bg-blue-600 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          title="Upload Release / New Build"
        >
          <MessageSquare className="w-5 h-5 fill-white stroke-[#0066FF]" />
        </button>
      </div>

      {/* CREATE APP MODAL */}
      <CreateAppModal
        isOpen={isCreateAppOpen}
        onClose={() => setIsCreateAppOpen(false)}
        onAppCreated={handleAppCreated}
      />

      {/* NEW RELEASE MODAL / DRAWER (WITH AUTOMATIC METADATA EXTRACTION & AUTOFILL) */}
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
