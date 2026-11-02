'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  Apple, 
  Copy, 
  ExternalLink, 
  X, 
  Clock, 
  Sparkles,
  FileCode,
  Check,
  Loader2,
  Package,
  Layers,
  Info
} from 'lucide-react';
import QRCodeViewer from './QRCodeViewer';
import { authFetch } from '@/lib/auth-fetch';

interface CreateReleasePanelProps {
  onReleaseCreated?: (newRelease: any) => void;
  onClose?: () => void;
  isPaidUser?: boolean;
  appId?: string;
  defaultAppName?: string;
}

export type Environment = 'DEV' | 'UAT' | 'PROD' | 'STAGING';
export type Platform = 'ios' | 'android';

export default function CreateReleasePanel({
  onReleaseCreated,
  onClose,
  isPaidUser = false,
  appId,
  defaultAppName = '',
}: CreateReleasePanelProps) {
  // Form State
  const [platform, setPlatform] = useState<Platform>('ios');
  const [environment, setEnvironment] = useState<Environment>('DEV');
  const [title, setTitle] = useState(defaultAppName);
  const [version, setVersion] = useState('1.0.0');
  const [buildNumber, setBuildNumber] = useState('1');
  const [bundleId, setBundleId] = useState('');
  const [minOsVersion, setMinOsVersion] = useState('');
  const [provisioningType, setProvisioningType] = useState('Ad-Hoc');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [appIcon, setAppIcon] = useState<string | null>(null);

  // Parsing & File State
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseSuccessMessage, setParseSuccessMessage] = useState<string | null>(null);

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [createdRelease, setCreatedRelease] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-parse IPA/APK and autofill fields
  const processAndParseFile = async (selected: File) => {
    setFile(selected);
    setUploadError(null);
    setParseSuccessMessage(null);

    const name = selected.name.toLowerCase();
    const detectedPlatform = name.endsWith('.ipa') ? 'ios' : name.endsWith('.apk') ? 'android' : platform;
    setPlatform(detectedPlatform);

    // Call server parser to extract metadata & icon
    setIsParsing(true);
    try {
      const formData = new FormData();
      formData.append('file', selected);

      const parseRes = await fetch('/api/parse-build', {
        method: 'POST',
        body: formData,
      });

      if (parseRes.ok) {
        const data = await parseRes.json();
        if (data.success) {
          if (data.title && (!title || title === defaultAppName)) {
            setTitle(data.title);
          }
          if (data.version) setVersion(data.version);
          if (data.build_number) setBuildNumber(data.build_number);
          if (data.bundle_id) setBundleId(data.bundle_id);
          if (data.min_os_version) setMinOsVersion(data.min_os_version);
          if (data.platform) setPlatform(data.platform);
          if (data.icon) setAppIcon(data.icon);

          setParseSuccessMessage(
            `✨ Extracted from ${selected.name}: v${data.version} (Build ${data.build_number}) • ${data.bundle_id}`
          );
        }
      }
    } catch (err) {
      console.warn('Autofill parse error, continuing with fallback:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAndParseFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAndParseFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select an .IPA or .APK file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadError(null);

    try {
      // 1. Get AWS S3 Presigned URL from backend
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || (platform === 'ios' ? 'application/octet-stream' : 'application/vnd.android.package-archive'),
          folder: `builds/${environment.toLowerCase()}`,
        }),
      });

      if (!presignRes.ok) {
        const errData = await presignRes.json();
        throw new Error(errData.error || 'Failed to initialize S3 upload');
      }

      const { uploadUrl, fileUrl, s3Key } = await presignRes.json();

      let finalFileUrl = fileUrl;
      let finalS3Key = s3Key;

      // 2. Direct S3 Upload with automatic server fallback
      try {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', uploadUrl, true);

          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable) {
              const percent = Math.round((evt.loaded / evt.total) * 70); // 20% to 90%
              setUploadProgress(20 + percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setUploadProgress(95);
              resolve();
            } else {
              reject(new Error(`Storage direct upload failed (Status ${xhr.status})`));
            }
          };

          xhr.onerror = () => {
            reject(new Error('S3 direct CORS block'));
          };

          xhr.send(file);
        });
      } catch (directErr) {
        console.warn('Direct S3 upload blocked, switching to server fallback stream...', directErr);
        // Fallback: upload stream to /api/upload/direct
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/upload/direct', true);
          xhr.setRequestHeader('Content-Type', 'application/octet-stream');
          xhr.setRequestHeader('x-file-name', file.name);
          xhr.setRequestHeader('x-folder', `builds/${environment.toLowerCase()}`);

          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable) {
              const percent = Math.round((evt.loaded / evt.total) * 70);
              setUploadProgress(20 + percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const fbData = JSON.parse(xhr.responseText);
                finalFileUrl = fbData.fileUrl;
                finalS3Key = fbData.s3Key;
                setUploadProgress(95);
                resolve();
              } catch (e) {
                reject(new Error('Invalid response from server upload'));
              }
            } else {
              reject(new Error(`Server upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error('Network error during upload'));
          xhr.send(file);
        });
      }

      // 3. Save release metadata in Supabase
      const createRes = await authFetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || file.name.replace(/\.[^/.]+$/, ''),
          platform,
          environment,
          version,
          build_number: buildNumber,
          bundle_id: bundleId,
          min_os_version: minOsVersion,
          provisioning_type: provisioningType,
          release_notes: releaseNotes,
          file_name: file.name,
          file_url: finalFileUrl,
          s3_key: finalS3Key,
          file_size: file.size,
          app_id: appId || null,
          icon_url: appIcon || null,
        }),
      });

      const resData = await createRes.json();
      if (!createRes.ok || resData.error) {
        throw new Error(resData.error || 'Failed to save release to database');
      }

      setUploadProgress(100);
      setCreatedRelease(resData.release);

      if (onReleaseCreated) {
        onReleaseCreated(resData.release);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err?.message || 'Upload failed. Please check network and AWS credentials.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdRelease?.slug) return;
    const publicUrl = `${window.location.origin}/download/${createdRelease.slug}`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setFile(null);
    setCreatedRelease(null);
    setUploadProgress(0);
    setUploadError(null);
    setParseSuccessMessage(null);
    setTitle(defaultAppName);
    setVersion('1.0.0');
    setBuildNumber('1');
    setBundleId('');
    setReleaseNotes('');
    setAppIcon(null);
  };

  const envColors: Record<Environment, { bg: string; text: string; border: string }> = {
    DEV: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    UAT: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    PROD: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    STAGING: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] w-full">
      {/* AppsOnAir Style Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-tight">Create New Release</h3>
            <p className="text-xs text-slate-500">Upload and configure APK or IPA build</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Retention Banner */}
      <div className={`px-6 py-2.5 text-xs flex items-center justify-between border-b ${
        isPaidUser 
          ? 'bg-emerald-50/90 text-emerald-800 border-emerald-100' 
          : 'bg-amber-50/90 text-amber-800 border-amber-100'
      }`}>
        <div className="flex items-center gap-2">
          {isPaidUser ? (
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          )}
          <span>
            {isPaidUser ? (
              <strong>Paid Plan: Lifetime Storage Active</strong>
            ) : (
              <strong>Free Tier: Builds remain active for 20 days</strong>
            )}
          </span>
        </div>
        <span className="text-[11px] font-semibold opacity-90">
          {isPaidUser ? 'Permanent' : '20 Days Retention'}
        </span>
      </div>

      {/* Body Area */}
      <div className="p-6 overflow-y-auto flex-1 space-y-5">
        {createdRelease ? (
          /* SUCCESS SCREEN AFTER RELEASE CREATED */
          <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200 py-2">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${envColors[createdRelease.environment as Environment]?.bg} ${envColors[createdRelease.environment as Environment]?.text} ${envColors[createdRelease.environment as Environment]?.border} mb-1.5`}>
                {createdRelease.environment} RELEASE
              </span>
              <h4 className="text-xl font-bold text-slate-900">{createdRelease.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Version {createdRelease.version} (Build {createdRelease.build_number}) • {createdRelease.platform?.toUpperCase()}
              </p>
            </div>

            {/* QR Code Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block max-w-sm w-full mx-auto">
              <p className="text-xs font-medium text-slate-600 mb-2">Scan with iPhone or Android to Install</p>
              <QRCodeViewer
                url={typeof window !== 'undefined' ? `${window.location.origin}/download/${createdRelease.slug}` : `https://app.local/download/${createdRelease.slug}`}
                title={createdRelease.title}
                size={170}
                showActions={false}
              />

              {/* Public Link box */}
              <div className="mt-3 flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1.5">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/download/${createdRelease.slug}` : `/download/${createdRelease.slug}`}
                  className="text-xs text-slate-600 bg-transparent flex-1 px-2 outline-none font-mono select-all truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#0066FF] text-white rounded-md hover:bg-blue-600 transition flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <a
                href={`/download/${createdRelease.slug}`}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0066FF] hover:bg-blue-600 text-white font-semibold text-sm rounded-xl transition shadow-sm"
              >
                Open Public Install Page
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={resetForm}
                className="w-full px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              >
                Upload Another Release
              </button>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Drag & Drop File Upload Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Select Build File (.ipa or .apk)
                </label>
                {isParsing && (
                  <span className="text-xs text-blue-600 font-medium flex items-center gap-1 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Autofilling info...
                  </span>
                )}
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  file
                    ? 'border-blue-500 bg-blue-50/20'
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ipa,.apk"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    {appIcon ? (
                      <img src={appIcon} alt="App Icon" className="w-12 h-12 rounded-xl shadow-sm border border-slate-200" />
                    ) : (
                      <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                        <FileCode className="w-6 h-6" />
                      </div>
                    )}
                    <div className="text-left min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate max-w-[240px]">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      Click to browse or drop <span className="text-blue-600 font-bold">.IPA</span> or <span className="text-emerald-600 font-bold">.APK</span> file
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Version &amp; package information will be auto-detected and filled
                    </p>
                  </div>
                )}
              </div>

              {/* Auto-fill notification badge */}
              {parseSuccessMessage && (
                <div className="mt-2 p-2.5 bg-blue-50/90 border border-blue-200/80 rounded-xl text-xs text-blue-800 font-medium flex items-center gap-2 animate-in fade-in">
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="truncate">{parseSuccessMessage}</span>
                </div>
              )}
            </div>

            {/* 2. Environment Selection (DEV, UAT, PROD, STAGING) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Release Environment
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['DEV', 'UAT', 'PROD', 'STAGING'] as Environment[]).map((env) => {
                  const isSelected = environment === env;
                  return (
                    <button
                      key={env}
                      type="button"
                      onClick={() => setEnvironment(env)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? 'border-[#0066FF] bg-blue-50 text-[#0066FF] shadow-sm ring-1 ring-[#0066FF]'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>{env}</span>
                      <span className="text-[10px] opacity-70">
                        {env === 'DEV' ? 'Internal' : env === 'UAT' ? 'Testing' : env === 'PROD' ? 'Live' : 'Stage'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Platform Selector (Auto-selected from file, but toggleable) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Platform
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlatform('ios')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    platform === 'ios'
                      ? 'border-[#0066FF] bg-blue-50/60 text-blue-900 ring-1 ring-[#0066FF]'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${platform === 'ios' ? 'bg-[#0066FF] text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Apple className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">Apple iOS</div>
                    <div className="text-[11px] text-slate-500">.IPA file (OTA ad-hoc)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPlatform('android')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    platform === 'android'
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${platform === 'android' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">Google Android</div>
                    <div className="text-[11px] text-slate-500">.APK package</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 4. Autofilled Release Meta Fields */}
            <div className="space-y-3.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  App Name / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. poc"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0066FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1.0.0"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0066FF] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Build Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1"
                    value={buildNumber}
                    onChange={(e) => setBuildNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0066FF] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Package / Bundle ID
                  </label>
                  <input
                    type="text"
                    placeholder="com.company.app"
                    value={bundleId}
                    onChange={(e) => setBundleId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0066FF] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minimum OS Version
                  </label>
                  <input
                    type="text"
                    placeholder={platform === 'ios' ? 'iOS 15.0+' : 'Android 8.0+'}
                    value={minOsVersion}
                    onChange={(e) => setMinOsVersion(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0066FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Release Notes / Changelog
                </label>
                <textarea
                  rows={2}
                  placeholder="What's new in this build..."
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0066FF]"
                />
              </div>
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="flex-1">{uploadError}</span>
              </div>
            )}

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Uploading to AWS S3...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#0066FF] h-2 rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button (AppsOnAir Blue #0066FF) */}
            <button
              type="submit"
              disabled={isUploading || isParsing || !file}
              className="w-full py-3 px-4 bg-[#0066FF] hover:bg-blue-600 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing S3 Upload...</span>
                </>
              ) : isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autofilling Build Info...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Publish {environment} Release</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
