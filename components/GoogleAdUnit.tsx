'use client';

import React, { useEffect } from 'react';

interface GoogleAdUnitProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
  label?: string;
}

export default function GoogleAdUnit({
  slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_DEFAULT || '1234567890',
  format = 'auto',
  responsive = true,
  className = '',
  label = 'Sponsored Advertisement',
}: GoogleAdUnitProps) {
  const clientId =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-7557474007097933';

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      // AdSense script may still be initializing or blocked by adblocker
    }
  }, []);

  return (
    <div
      className={`w-full max-w-xl mx-auto bg-white/80 border border-slate-200/80 rounded-2xl p-3 text-center overflow-hidden shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between px-1 mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <a
          href="/premium"
          className="text-[10px] font-bold text-[#0066FF] hover:underline"
        >
          Remove Ads with Pro &rarr;
        </a>
      </div>

      <ins
        className="adsbygoogle block"
        style={{ display: 'block', minHeight: '90px' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

