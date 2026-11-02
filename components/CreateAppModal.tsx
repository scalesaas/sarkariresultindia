'use client';

import React, { useState } from 'react';
import { X, Smartphone, Apple, Loader2, AlertCircle } from 'lucide-react';
import { authFetch } from '@/lib/auth-fetch';

interface CreateAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppCreated: (newApp: any) => void;
}

export default function CreateAppModal({
  isOpen,
  onClose,
  onAppCreated,
}: CreateAppModalProps) {
  const [name, setName] = useState('');
  const [bundleId, setBundleId] = useState('');
  const [platform, setPlatform] = useState<'both' | 'ios' | 'android'>('both');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await authFetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          bundle_id: bundleId.trim() || null,
          platform,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to create app');
      }

      onAppCreated(data.app);
      onClose();
      setName('');
      setBundleId('');
    } catch (err: any) {
      setError(err?.message || 'Error creating app');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Create New App</h3>
            <p className="text-xs text-slate-500 mt-0.5">Add a new app workspace for your iOS &amp; Android builds</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              App Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. poc or Sarkari News"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0066FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Package / Bundle ID (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. com.example.poc"
              value={bundleId}
              onChange={(e) => setBundleId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0066FF] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Supported Platform
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPlatform('both')}
                className={`py-2.5 px-2 text-xs font-semibold rounded-xl border text-center transition ${
                  platform === 'both'
                    ? 'border-[#0066FF] bg-blue-50 text-[#0066FF] ring-1 ring-[#0066FF]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Both
              </button>
              <button
                type="button"
                onClick={() => setPlatform('ios')}
                className={`py-2.5 px-2 text-xs font-semibold rounded-xl border text-center transition flex items-center justify-center gap-1.5 ${
                  platform === 'ios'
                    ? 'border-[#0066FF] bg-blue-50 text-[#0066FF] ring-1 ring-[#0066FF]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Apple className="w-3.5 h-3.5" /> iOS
              </button>
              <button
                type="button"
                onClick={() => setPlatform('android')}
                className={`py-2.5 px-2 text-xs font-semibold rounded-xl border text-center transition flex items-center justify-center gap-1.5 ${
                  platform === 'android'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Android
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-5 py-2.5 bg-[#0066FF] hover:bg-blue-600 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition shadow-sm flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Create App</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
