import React from "react";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStenoExercises } from "@/lib/actions/blog";
import { 
  Mic, 
  Play, 
  Lock, 
  Clock, 
  TrendingUp, 
  FileText 
} from "lucide-react";

export const dynamic = "force-dynamic"; // Ensure fresh data on every load

export default async function StenoListingPage() {
  // 1. Fetch Exercises
  const exercises = await getStenoExercises();
  
  // 2. Check User Subscription (to show/hide Lock icons)
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let isPremiumUser = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .single();
    isPremiumUser = profile?.is_premium || false;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Mic className="text-blue-600 w-8 h-8" /> Steno Dictation Library
            </h1>
            <p className="text-gray-500 mt-2">
              Select a dictation to practice your shorthand and transcription speed.
            </p>
          </div>
          
          {/* Optional: Add a 'Create' button if admin */}
          {/* <Link href="/steno/create">
            <Button>Upload New Dictation</Button>
          </Link> */}
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.length > 0 ? (
            exercises.map((exercise) => {
              const isLocked = exercise.is_premium && !isPremiumUser;

              return (
                <Card 
                  key={exercise.id} 
                  className={`flex flex-col h-full hover:shadow-lg transition-all duration-300 border-t-4 ${
                    isLocked ? "border-t-yellow-400 opacity-90" : "border-t-blue-500"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="mb-2 bg-gray-50">
                        {exercise.category}
                      </Badge>
                      {isLocked && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1">
                          <Lock className="w-3 h-3" /> Premium
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl text-gray-800 line-clamp-2 leading-tight">
                      {exercise.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">{exercise.wpm} WPM</span>
                      </div>
                      <div className="flex items-center gap-2">
                         {/* Simple visual indicator for difficulty */}
                        <div className={`w-2 h-2 rounded-full ${
                          exercise.difficulty === 'Hard' ? 'bg-red-500' : 
                          exercise.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <span>{exercise.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span>Transcript</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {/* Placeholder for duration if you add it later, or just 'Audio' */}
                        <span>Audio Ready</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 border-t bg-gray-50/50">
                    {isLocked ? (
                      <Link href="/pricing" className="w-full">
                         <Button variant="outline" className="w-full gap-2 text-yellow-700 border-yellow-200 hover:bg-yellow-50">
                           <Lock className="w-4 h-4" /> Unlock Content
                         </Button>
                      </Link>
                    ) : (
                      <Link href={`/stenography/${exercise.id}`} className="w-full">
                        <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 group">
                           Start Practice 
                           <Play className="w-4 h-4 fill-current group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-gray-300">
               <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Mic className="w-8 h-8 opacity-50" />
               </div>
               <h3 className="text-lg font-bold text-gray-900">No Dictations Found</h3>
               <p className="text-gray-500">Check back later or ask your admin to upload exercises.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}