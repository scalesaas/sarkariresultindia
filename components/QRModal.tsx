'use client';

import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import QRCodeViewer from './QRCodeViewer';

interface QRModalProps {
  release: any | null;
  onClose: () => void;
}

export default function QRModal({ release, onClose }: QRModalProps) {
  const [copied, setCopied] = useState(false);

  if (!release) return null;

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/download/${release.slug}`
    : `/download/${release.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="inline-flex p-2 rounded-2xl bg-blue-50 text-blue-600 mb-1">
            <QrCode className="w-6 h-6" />
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-lg leading-snug">{release.title}</h3>
            <p className="text-xs text-slate-500">
              {release.environment} Release • v{release.version} ({release.platform?.toUpperCase()})
            </p>
          </div>

          <div className="py-2">
            <QRCodeViewer
              url={publicUrl}
              title={release.title}
              size={180}
              showActions={false}
            />
          </div>

          {/* Link box */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-left">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="text-xs text-slate-600 bg-transparent flex-1 px-2 outline-none font-mono select-all truncate"
            />
            <button
              onClick={copyLink}
              className="px-2.5 py-1 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition flex items-center gap-1 flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="pt-2 flex gap-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition shadow-sm"
            >
              Open Install Page
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

