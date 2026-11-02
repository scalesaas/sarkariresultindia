'use client';

import React, { useState, useEffect } from 'react';
import { Cloud, Mail, Lock, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        window.location.href = '/dashboard';
      }
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
    } catch (e: any) {
      setMessage(e.message || 'Google sign in failed');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          },
        });

        if (error) {
          setMessage(error.message);
          setIsSuccess(false);
        } else if (data.session) {
          window.location.href = '/dashboard';
        } else {
          setMessage('Account created! Check your email for the confirmation link, or sign in directly.');
          setIsSuccess(true);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
          setIsSuccess(false);
        } else if (data.session) {
          window.location.href = '/dashboard';
        }
      }
    } catch (err: any) {
      setMessage(err?.message || 'Authentication error');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between items-center p-4 font-sans">
      {/* Top Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between pt-2 px-2">
        <a href="/" className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#0066FF] transition">
          <img src="/logo.png" alt="DropOnAir Logo" className="w-7 h-7 object-contain" />
          <span>DropOnAir</span>
        </a>
        <a
          href="/premium"
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1.5 transition"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Buy Premium</span>
        </a>
      </div>

      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xl relative my-8">
        {/* Top Banner Image */}
        <div className="w-full bg-[#05081c] relative overflow-hidden">
          <img
            src="/Droponairbanner.png"
            alt="DropOnAir Banner"
            className="w-full h-32 object-cover object-center"
          />
        </div>

        <div className="p-8">
          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isSignUp ? 'Create your DropOnAir account' : 'Sign in to DropOnAir'}
            </h2>
            <p className="text-xs text-slate-500 mt-1.5">
              Sign in to access your DropOnAir dashboard, create apps, and distribute IPA &amp; APK builds
            </p>
          </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-3 border border-slate-200"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span className="bg-white px-3">Or continue with email</span>
          </div>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0066FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0066FF]"
              />
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              isSuccess 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {isSuccess ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#0066FF] hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In to Dashboard'}</span>
          </button>
        </form>

        {/* Toggle sign in / sign up */}
        <div className="mt-6 text-center text-xs text-slate-500">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="text-[#0066FF] hover:underline font-bold"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="text-[#0066FF] hover:underline font-bold"
              >
                Sign Up
              </button>
            </p>
          )}
        </div>
        </div>
      </div>

      {/* Developer Footer Banner */}
      <div className="text-center text-xs text-slate-500 pb-4">
        Built by <strong className="text-slate-800">Ashish</strong> •{' '}
        <a href="/premium" className="text-[#0066FF] font-semibold hover:underline">
          Buy Premium / Contact Me
        </a>{' '}
        •{' '}
        <a href="mailto:ashishrohilla510@gmail.com" className="text-[#0066FF] font-semibold hover:underline">
          ashishrohilla510@gmail.com
        </a>
      </div>
    </div>
  );
}
