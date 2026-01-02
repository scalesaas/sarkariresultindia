import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Lock, ChevronLeft, Star } from "lucide-react";
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

  // 3. Check Subscription Status (If the exercise is Premium)
  let isPremiumUser = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .single();
    isPremiumUser = profile?.is_premium || false;
  }

  // --- ACCESS DENIED VIEW ---
  // If exercise is Premium AND user is NOT Premium -> Block access
  if (exercise.is_premium && !isPremiumUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-yellow-100">
          <div className="w-20 h-20 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Premium Content</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            This high-speed dictation <strong>({exercise.title})</strong> is reserved for premium members. Upgrade your plan to access our full library.
          </p>
          
          <div className="space-y-3">
            <Link href="/pricing" className="w-full block">
              <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold h-12 text-lg shadow-md shadow-yellow-100">
                Unlock Premium Access
              </Button>
            </Link>
            <Link href="/steno" className="w-full block">
              <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-900">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Fetch User's Personal Best (Contextual Data)
  // We want to show "Your Best: 98%" on the practice screen if they tried before
  let previousBest = null;
  if (user) {
    const { data: attempts } = await supabase
      .from("steno_attempts")
      .select("accuracy_percentage")
      .eq("user_id", user.id)
      .eq("exercise_id", exercise.id)
      .order("accuracy_percentage", { ascending: false }) // Highest score first
      .limit(1);

    if (attempts && attempts.length > 0 && attempts[0]) {
      previousBest = attempts[0].accuracy_percentage;
    }
  }

  // 5. Render the Client App
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-20">
      
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 px-4 md:px-8 flex items-center justify-between">
         <Link href="/steno" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">Back to Library</span>
         </Link>

         {previousBest !== null && (
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-200 text-sm font-semibold">
               <Star className="w-4 h-4 fill-current" />
               <span>Personal Best: {previousBest}%</span>
            </div>
         )}
      </div>

      {/* Main Content Area */}
      <StenoPracticeClient 
        exercise={exercise} 
        user={user} 
        previousBest={previousBest} 
      />
    </div>
  );
}