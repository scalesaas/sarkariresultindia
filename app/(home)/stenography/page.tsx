import React from "react";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStenoExercises } from "@/lib/actions/blog";
import Navbar from "@/app/navbar/navbar";
import { 
  Mic, 
  Play, 
  Lock, 
  Clock, 
  Zap, 
  Trophy,
  Crown,
  Sparkles,
  ArrowRight,
  Headphones
} from "lucide-react";

export const dynamic = "force-dynamic"; 

export default async function StenoListingPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Fetch Exercises
  const exercises = await getStenoExercises();
  
  // 2. Fetch User Profile (Premium Status)
  let isPremiumUser = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profile")
      .select("is_premium")
      .eq("id", user.id)
      .single();
    isPremiumUser = profile?.is_premium || false;
  }

  // 3. Fetch User's Best Results
  let userResultsMap: Record<string, any> = {};
  
  if (user) {
    const { data: results } = await supabase
      .from("steno_attempts") 
      .select("exercise_id, accuracy_percentage")
      .eq("user_id", user.id);

    if (results) {
      results.forEach((res) => {
        const currentBest = userResultsMap[res.exercise_id];
        if (!currentBest || res.accuracy_percentage > currentBest.accuracy_percentage) {
            userResultsMap[res.exercise_id] = res;
        }
      });
    }
  }

  return (
   <div>
    <Navbar/>
     <div className="min-h-screen bg-[#FDFCF8] pt-24 pb-20 px-4 sm:px-6">
      
      <div className="max-w-6xl mx-auto">
        
        {/* --- HERO HEADER --- */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-amber-100 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Headphones className="w-3.5 h-3.5" />
              Practice Library
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Master Your Speed
            </h1>
            <p className="text-gray-500 mt-3 text-lg max-w-2xl">
              Access <span className="font-semibold text-gray-900">{exercises.length}</span> dictation exercises. 
              {isPremiumUser ? (
                <span className="text-amber-600 font-medium ml-1">You have full Premium access.</span>
              ) : (
                <span className="text-gray-400 ml-1">Upgrade to unlock high-speed dictations.</span>
              )}
            </p>
          </div>
          
          {/* Quick Legend */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center justify-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm min-w-[100px]">
               <span className="text-xs text-gray-400 font-semibold uppercase">Total</span>
               <span className="text-2xl font-bold text-gray-900">{exercises.length}</span>
            </div>
            {user && (
            <div className="flex flex-col items-center justify-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm min-w-[100px]">
               <span className="text-xs text-gray-400 font-semibold uppercase">Attempted</span>
               <span className="text-2xl font-bold text-amber-600">{Object.keys(userResultsMap).length}</span>
            </div>
            )}
          </div>
        </div>

        {/* --- EXERCISE GRID --- */}
        <div className="grid grid-cols-1 gap-4">
          {exercises.length > 0 ? (
            exercises.map((exercise) => {
              const isLocked = exercise.is_premium && !isPremiumUser;
              const personalBest = userResultsMap[exercise.id];
              const isMastered = personalBest?.accuracy_percentage >= 95;
              
              // Dynamic Classes based on status
              const cardBorderClass = isLocked 
                ? "border-gray-200 bg-gray-50/50" 
                : exercise.is_premium 
                  ? "border-amber-200 bg-gradient-to-r from-white to-amber-50/30 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/50" 
                  : "border-gray-200 bg-white hover:border-blue-200 hover:shadow-md";

              return (
                <div 
                  key={exercise.id} 
                  className={`relative group rounded-2xl border p-5 transition-all duration-300 ease-in-out ${cardBorderClass}`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                    
                    {/* 1. ICON BLOCK */}
                    <div className="relative flex-shrink-0">
                      <div className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm
                        ${isLocked ? 'bg-gray-100 text-gray-400' : 
                          isMastered ? 'bg-green-100 text-green-600' : 
                          exercise.is_premium ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'}
                      `}>
                         {isLocked ? <Lock className="w-7 h-7" /> : 
                          isMastered ? <Trophy className="w-7 h-7" /> :
                          exercise.is_premium ? <Crown className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                      </div>
                      
                      {/* Difficulty Badge (Absolute) */}
                      <div className={`
                        absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-sm whitespace-nowrap
                        ${exercise.difficulty === 'Hard' ? 'bg-red-50 border-red-100 text-red-600' : 
                          exercise.difficulty === 'Medium' ? 'bg-orange-50 border-orange-100 text-orange-600' : 
                          'bg-green-50 border-green-100 text-green-600'}
                      `}>
                        {exercise.difficulty}
                      </div>
                    </div>

                    {/* 2. CONTENT BLOCK */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          {exercise.category}
                        </span>
                        {exercise.is_premium && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-md">
                            <Sparkles className="w-3 h-3" /> PRO
                          </span>
                        )}
                      </div>

                      <h3 className={`text-xl font-bold truncate pr-4 ${isLocked ? 'text-gray-500' : 'text-gray-900 group-hover:text-amber-700 transition-colors'}`}>
                        {exercise.title}
                      </h3>

                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-semibold text-gray-700">{exercise.wpm}</span> WPM
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>~3 min</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. ACTION & STATS BLOCK */}
                    <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 mt-2 md:mt-0">
                      
                      {/* Personal Best Stat */}
                      {personalBest && !isLocked && (
                        <div className="flex flex-col items-end pr-6 md:border-r border-gray-100">
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Best score</span>
                          <div className={`text-2xl font-black leading-none ${personalBest.accuracy_percentage >= 90 ? 'text-green-600' : 'text-gray-700'}`}>
                            {personalBest.accuracy_percentage}<span className="text-sm">%</span>
                          </div>
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="min-w-[160px]">
                        {isLocked ? (
                          <Link href="/pricing" className="w-full">
                            <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-200/50">
                              Unlock Access <Lock className="ml-2 w-4 h-4" />
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/stenography/${exercise.id}`} className="w-full">
                            {personalBest ? (
                              <Button variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300">
                                Practice Again
                              </Button>
                            ) : (
                              <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-200">
                                Start Practice <ArrowRight className="ml-2 w-4 h-4" />
                              </Button>
                            )}
                          </Link>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          ) : (
            // EMPTY STATE
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
               <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Mic className="w-10 h-10" />
               </div>
               <h3 className="text-xl font-bold text-gray-900">No Dictations Found</h3>
               <p className="text-gray-500 mt-2 max-w-md mx-auto">
                 We couldn't find any exercises matching your criteria. Please check back later or contact support.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
   </div>
  );
}