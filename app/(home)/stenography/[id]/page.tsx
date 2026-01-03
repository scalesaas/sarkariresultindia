import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  Lock, 
  ArrowLeft, 
  Trophy, 
  Crown, 
  Sparkles, 
  Zap 
} from "lucide-react";
import StenoPracticeClient from "../components/StenoPracticeClient";

export default async function StenoPracticePage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();

  // 1. Get Current User
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Fetch the Exercise Details
  const { data: exercise, error } = await supabase
    .from("steno_exercises")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !exercise) {
    return notFound();
  }

  // 3. Check Subscription Status
  let isPremiumUser = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profile")
      .select("is_premium")
      .eq("id", user.id)
      .single();
    isPremiumUser = profile?.is_premium || false;
  }

  // --- ACCESS DENIED VIEW (Upsell UI) ---
  if (exercise.is_premium && !isPremiumUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-white to-gray-50">
        <div className="relative bg-white p-10 rounded-3xl shadow-2xl shadow-amber-100/50 max-w-lg w-full text-center border border-amber-100 overflow-hidden">
          
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-yellow-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

          {/* Icon */}
          <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-100 to-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-4 ring-white">
            <Lock className="w-10 h-10 text-amber-600" strokeWidth={1.5} />
            <div className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-sm">
              <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            </div>
          </div>
          
          {/* Content */}
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Premium Masterclass
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed text-lg">
            You've discovered <span className="font-semibold text-gray-800">"{exercise.title}"</span>. 
            This advanced dictation is crafted exclusively for our Pro learners.
          </p>
          
          <div className="space-y-4">
            <Link href="/pricing" className="w-full block group">
              <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold h-14 text-lg rounded-xl shadow-lg shadow-amber-200 transition-all duration-300 transform group-hover:-translate-y-0.5">
                <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                Unlock Full Access
              </Button>
            </Link>
            <Link href="/stenography" className="w-full block">
              <Button variant="ghost" className="w-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 font-medium">
                Return to Dashboard
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-amber-600/70 bg-amber-50 py-2 rounded-lg">
            <Zap className="w-3 h-3" />
            <span>Join 2,000+ stenographers practicing today</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. Fetch User's Personal Best
  let previousBest = null;
  if (user) {
    const { data: attempts } = await supabase
      .from("steno_attempts")
      .select("accuracy_percentage")
      .eq("user_id", user.id)
      .eq("exercise_id", exercise.id)
      .order("accuracy_percentage", { ascending: false })
      .limit(1);

    if (attempts && attempts.length > 0 && attempts[0]) {
      previousBest = attempts[0].accuracy_percentage;
    }
  }

  // 5. SUCCESS VIEW (The Practice Interface)
  return (
    <div className="min-h-screen bg-[#FDFCF8]"> {/* Warm, paper-like background */}
      
      {/* PROFESSIONAL HEADER */}
      <header className="fixed top-0 left-0 right-0 h-18 bg-white/80 backdrop-blur-xl border-b border-amber-100 z-50 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          
          {/* Left: Navigation */}
          <Link 
            href="/steno" 
            className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors py-2 pr-4 rounded-lg"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-amber-700" />
            </div>
            <span className="font-medium text-sm hidden sm:inline-block">Library</span>
          </Link>

          {/* Center: Exercise Context (Optional, good for focus) */}
          <div className="hidden md:flex flex-col items-center">
            <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">Now Practicing</span>
            <h2 className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{exercise.title}</h2>
          </div>

          {/* Right: Status Indicators */}
          <div className="flex items-center gap-3">
            
            {/* LOGIC: Show Premium Active Badge if User is Premium AND Exercise is Premium */}
            {isPremiumUser && exercise.is_premium && (
              <div className="hidden sm:flex items-center gap-1.5 pl-1 pr-3 py-1 bg-gradient-to-r from-amber-100 to-yellow-50 border border-amber-200 rounded-full shadow-sm">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                   <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-tight">Premium</span>
                  <span className="text-[10px] font-medium text-amber-600">Active</span>
                </div>
              </div>
            )}

            {/* Personal Best Badge */}
            {previousBest !== null && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <div className="flex flex-col leading-none">
                   <span className="text-[10px] text-gray-400 font-medium uppercase">Best</span>
                   <span className="text-sm font-bold text-gray-900">{previousBest}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area - Centered Focus Mode */}
      <main className="pt-24 pb-12 px-4 md:px-6 max-w-5xl mx-auto">
        <StenoPracticeClient 
          exercise={exercise} 
          user={user} 
          previousBest={previousBest} 
        />
      </main>

    </div>
  );
}