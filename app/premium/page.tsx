'use client';

import React, { useState } from 'react';
import {
  Cloud,
  Sparkles,
  Check,
  Mail,
  Copy,
  Send,
  ShieldCheck,
  Infinity as InfinityIcon,
  Zap,
  Globe,
  Code2,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Layers,
  Smartphone,
  Apple,
  Terminal,
} from 'lucide-react';

export default function BuyPremiumPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('DropOnAir Lifetime Pro');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [emailCopied, setEmailCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const developerEmail = 'ashishrohilla510@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(developerEmail);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const buildMailtoUrl = () => {
    const subject = encodeURIComponent(`[DropOnAir] ${selectedPlan} Inquiry from ${name || 'Customer'}`);
    const body = encodeURIComponent(
      `Hi Ashish,\n\nI am interested in: ${selectedPlan}\n\nName: ${name || 'N/A'}\nEmail: ${email || 'N/A'}\nCompany / App: ${company || 'N/A'}\n\nDetails / Requirements:\n${
        message || 'I would like to activate DropOnAir Premium / discuss my project.'
      }\n\nBest regards,\n${name || ''}`
    );
    return `mailto:${developerEmail}?subject=${subject}&body=${body}`;
  };

  const buildGmailUrl = () => {
    const subject = encodeURIComponent(`[DropOnAir] ${selectedPlan} Inquiry from ${name || 'Customer'}`);
    const body = encodeURIComponent(
      `Hi Ashish,\n\nI am interested in: ${selectedPlan}\n\nName: ${name || 'N/A'}\nEmail: ${email || 'N/A'}\nCompany / App: ${company || 'N/A'}\n\nDetails / Requirements:\n${
        message || 'I would like to activate DropOnAir Premium / discuss my project.'
      }\n\nBest regards,\n${name || ''}`
    );
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${developerEmail}&su=${subject}&body=${body}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.location.href = buildMailtoUrl();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2.5 group">
              <img src="/logo.png" alt="DropOnAir Logo" className="w-9 h-9 object-contain" />
              <div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-none">
                  DropOnAir
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  OTA App Distribution
                </span>
              </div>
            </a>

            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
              <a href="/" className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition">
                Home
              </a>
              <a href="/#features" className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition">
                Features
              </a>
              <a href="/#inspector" className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition">
                Build Inspector
              </a>
              <a href="/premium" className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#0066FF] font-bold">
                Buy Premium
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Dashboard
            </a>
            <a
              href="#contact-form"
              className="px-4 py-2 bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Ashish</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-14 pb-12 px-6">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>DROPONAIR PREMIUM &amp; DIRECT DEVELOPER CONTACT</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Unlock Lifetime Storage &amp;{' '}
              <span className="text-[#0066FF]">Unlimited OTA Distribution</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Upgrade your account to remove the 20-day build expiration limit, unlock unlimited iOS &amp; Android workspaces, or hire <strong className="text-slate-900">Ashish</strong> for custom white-label engineering.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Tier 1: Free Starter */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    Starter Tier
                  </span>
                  <span className="text-xs font-semibold text-slate-400">20-Day Retention</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Free Forever</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">$0</span>
                  <span className="text-xs text-slate-500 font-medium">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Ideal for quick QA testing and temporary build sharing with stakeholders.
                </p>

                <ul className="mt-6 space-y-3 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>iOS (.IPA) &amp; Android (.APK) OTA installs</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Builds stay active for <strong>20 days</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant in-browser metadata autofill</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Auto-generated QR codes &amp; public links</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>DEV, UAT, STAGING &amp; PROD badges</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <a
                  href="/dashboard"
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  <span>Continue with Free Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Tier 2: DropOnAir Lifetime Pro (Highlighted) */}
            <div className="bg-slate-900 text-white rounded-3xl border-2 border-[#0066FF] p-7 shadow-2xl relative flex flex-col justify-between transform md:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#0066FF] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Most Popular</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    DropOnAir Pro
                  </span>
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    👑 Lifetime Access
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white">Lifetime Premium</h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">Custom / One-Time</span>
                </div>
                <p className="text-xs text-slate-300 mt-2">
                  Permanent storage with zero build expiration for studios, agencies, and product teams.
                </p>

                <ul className="mt-6 space-y-3 text-xs text-slate-200 font-medium">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Permanent Lifetime Storage</strong> (Never expires)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Unlimited Apps</strong> &amp; Release Channels</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>High-Speed AWS S3 Multipart Upload (Large IPAs/APKs)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Short Install Links (<code className="text-blue-300">/d/slug</code>) &amp; QR Sharing</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>CI/CD Automation &amp; REST API Upload Support</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Direct Priority Support from Ashish</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <a
                  href="#contact-form"
                  onClick={() => setSelectedPlan('DropOnAir Lifetime Pro')}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#0066FF] hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Buy Lifetime Premium</span>
                </a>
              </div>
            </div>

            {/* Tier 3: White-Label / Hire Ashish */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    Enterprise &amp; Custom
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Dedicated</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">White-Label / Hire Me</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">Let&apos;s Talk</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Need your own self-hosted DropOnAir portal or a senior engineer for your next project?
                </p>

                <ul className="mt-6 space-y-3 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span><strong>Custom Domain &amp; White-Label Branding</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Deploy on your own AWS S3 &amp; Supabase account</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Full-Stack Web, iOS &amp; Android App Development</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Custom CI/CD Pipelines (GitHub Actions / Fastlane)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>1-on-1 Consultation &amp; Dedicated SLA</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <a
                  href="#contact-form"
                  onClick={() => setSelectedPlan('White-Label / Hire Ashish')}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Hire Ashish / Custom Quote</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Buy Premium Form Section */}
        <section id="contact-form" className="max-w-5xl mx-auto px-6 pb-20">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-5">
            {/* Left Info Column */}
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-6 relative z-10">
                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#05081c]">
                  <img
                    src="/Droponairbanner.png"
                    alt="Drop on Air Banner"
                    className="w-full h-28 object-cover object-center"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    Get in Touch with Ashish
                  </h2>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Fill out the inquiry form or reach out directly via email. Premium upgrades are activated rapidly for your DropOnAir account.
                  </p>
                </div>

                {/* Email Box */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Direct Developer Email
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-300 truncate">
                      {developerEmail}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 transition"
                    >
                      {emailCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Instant account upgrade on your registered email</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <InfinityIcon className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>All existing 20-day releases convert to Lifetime</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Fast response time (typically within a few hours)</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-slate-800 relative z-10 flex flex-col gap-2">
                <a
                  href={`mailto:${developerEmail}?subject=DropOnAir%20Premium%20Upgrade%20Inquiry`}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs text-center transition flex items-center justify-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open Default Email App</span>
                </a>
                <a
                  href={buildGmailUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0066FF] hover:bg-blue-500 text-white font-bold text-xs text-center transition flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Compose in Gmail Directly</span>
                </a>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-3 p-8">
              <h3 className="text-xl font-extrabold text-slate-900">
                Send a Premium Upgrade or Project Inquiry
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Select what you need below and send your details directly to Ashish.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    What are you interested in?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      'DropOnAir Lifetime Pro',
                      'White-Label / Custom OTA',
                      'Hire Ashish (App / Web Dev)',
                      'Enterprise Team Plan',
                    ].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSelectedPlan(option)}
                        className={`p-3 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${
                          selectedPlan === option
                            ? 'border-[#0066FF] bg-blue-50/70 text-[#0066FF] ring-1 ring-[#0066FF]'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{option}</span>
                        {selectedPlan === option && <CheckCircle2 className="w-4 h-4 text-[#0066FF] shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0066FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Your DropOnAir / Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0066FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Company or App Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Mobile Studio"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Message / Project Details
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell me about your app distribution needs, number of builds, or custom development requirements..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0066FF]"
                  />
                </div>

                {submitted && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Inquiry Ready to Send!</p>
                      <p className="mt-0.5">
                        Your email client has been opened with your message to <strong>{developerEmail}</strong>. You can also click{' '}
                        <a href={buildGmailUrl()} target="_blank" rel="noreferrer" className="underline font-bold">
                          Send via Gmail
                        </a>{' '}
                        if your browser didn&apos;t launch an email app.
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 px-6 bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Inquiry to Ashish</span>
                  </button>
                  <a
                    href={buildGmailUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4 text-[#0066FF]" />
                    <span>Open in Gmail</span>
                  </a>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/90 py-6 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="DropOnAir Logo" className="w-6 h-6 object-contain" />
            <span className="font-bold text-slate-900">DropOnAir</span>
            <span>• Built by Ashish</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="hover:text-slate-900 transition">Home</a>
            <a href="/dashboard" className="hover:text-slate-900 transition">Dashboard</a>
            <a href={`mailto:${developerEmail}`} className="text-[#0066FF] font-semibold hover:underline">
              {developerEmail}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

