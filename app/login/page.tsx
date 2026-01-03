"use client";

import Link from "next/link";
import { useState } from "react";
// We don't need useRouter for the redirect anymore
import { signIn, signUp } from "./actions"; 
import Loginform from "../navbar/loginform";

export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(searchParams?.message || "");

  // --- Client Side Submit Handler ---
  const handleSignIn = async (formData: FormData) => {
    setLoading(true);
    setMessage("");

    const result = await signIn(formData);

    if (result?.error) {
      setMessage(result.error);
      setLoading(false);
    } else if (result?.success) {
      // ---------------------------------------------------------
      // THE FIX: Hard Browser Redirect
      // ---------------------------------------------------------
      // This bypasses Next.js cache entirely and requests the 
      // homepage fresh from the server with your new auth cookie.
      window.location.href = "/";
    }
  };

  const handleSignUp = async (formData: FormData) => {
    setLoading(true);
    setMessage("");
    const result = await signUp(formData);
    if (result?.error) {
      setMessage(result.error);
      setLoading(false);
    } else if (result?.success && result.message) {
      setMessage(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="justify-center flex pt-[90px]">
      <div className="flex-1 pt-10 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <Link
          href="/"
          className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>{' '}
          Back
        </Link>
        <h3 className="text-3xl font-extrabold mb-8 max-md:text-center">
          Sign in
        </h3>

        <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground" action={handleSignIn}>
          <label className="text-md" htmlFor="email">Email</label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
            name="email"
            placeholder="you@example.com"
            required
          />
          
          <label className="text-md" htmlFor="password">Password</label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-3 block text-sm">Remember me</label>
            </div>
            <div className="text-sm">
              <a href="#" className="text-blue-600 hover:text-blue-500">Forgot password?</a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2 disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          
          <button
            formAction={handleSignUp}
            disabled={loading}
            className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2 disabled:opacity-50"
          >
            Sign Up
          </button>

          {message && (
            <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
              {message}
            </p>
          )}
        </form>
        
        <p className="my-4 text-sm text-gray-400 text-center">or continue with</p>
        <Loginform />
      </div>
    </div>
  );
}