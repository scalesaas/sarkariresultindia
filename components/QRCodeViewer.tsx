'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, QrCode as QrIcon } from 'lucide-react';

interface QRCodeViewerProps {
  url: string;
  title?: string;
  size?: number;
  showActions?: boolean;
}

export default function QRCodeViewer({
  url,
  title,
  size = 200,
  showActions = true,
}: QRCodeViewerProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, {
      width: size * 2,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((res) => setDataUrl(res))
      .catch((err) => console.error('Failed to generate QR:', err));
  }, [url, size]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }
  };

  const downloadQR = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${title ? title.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'app'}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 inline-block">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="App QR Code"
            style={{ width: size, height: size }}
            className="rounded-lg block"
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="flex items-center justify-center bg-slate-100 rounded-lg text-slate-400"
          >
            <QrIcon className="w-8 h-8 animate-pulse text-slate-400" />
          </div>
        )}
      </div>

      {showActions && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-lg transition-all"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            {copied ? 'Copied Link' : 'Copy Link'}
          </button>

          <button
            onClick={downloadQR}
            disabled={!dataUrl}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-lg transition-all disabled:opacity-50"
            title="Download QR Image"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Download QR
          </button>
        </div>
      )}
    </div>
  );
}

