"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress"; // Ensure you have this shadcn component
import { diffWords } from "diff"; 
import StenoDashboard from "./StenoDashboard";
import { saveStenoProgress } from "@/lib/actions/blog";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  PenTool, 
  Keyboard, 
  ChevronRight, 
  AlertCircle, 
  Trophy, 
  Loader2,
  Volume2
} from "lucide-react";

// --- Types ---
interface Exercise {
  id: string;
  title: string;
  audio_url: string;
  transcript: string;
  wpm: number;
}

interface StenoClientProps {
  exercise: Exercise;
  user: any;
  previousBest: number | null;
}

export default function StenoPracticeClient({ exercise, user, previousBest }: StenoClientProps) {
  const router = useRouter();

  // --- State Management ---
  const [phase, setPhase] = useState<'listening' | 'typing' | 'result'>('listening');
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Typing State
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // Score State
  const [score, setScore] = useState({ accuracy: 0, errors: 0, wpm: 0 });
  const [isSaving, setIsSaving] = useState(false);

  // --- Audio Handlers ---
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || 1;
      setAudioProgress((current / total) * 100);
      setDuration(total);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- Transition Logic ---
  const startTypingPhase = () => {
    setPhase('typing');
    setStartTime(Date.now());
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current.currentTime = 0; // Reset audio for review purposes
    }
  };

  // --- Scoring Engine ---
  const calculateResult = async () => {
    if (!startTime) return;
    
    // 1. Calculate Typing Speed (WPM)
    const endTime = Date.now();
    const durationInMinutes = (endTime - startTime) / 60000;
    const wordsTyped = userInput.trim().split(/\s+/).length;
    // Prevent divide by zero if super fast
    const typingSpeedWPM = durationInMinutes > 0 ? Math.round(wordsTyped / durationInMinutes) : 0;

    // 2. Calculate Accuracy & Errors (The Core Logic)
    const cleanOriginal = exercise.transcript.trim().replace(/\s+/g, ' '); 
    const cleanUser = userInput.trim().replace(/\s+/g, ' ');
    
    const diff = diffWords(cleanOriginal, cleanUser);
    
    let errorCount = 0;
    
    diff.forEach(part => {
      // Logic: 
      // Added words (user typed extra) = Errors
      // Removed words (user missed) = Errors
      if (part.added || part.removed) {
        errorCount += part.value.trim().split(/\s+/).length;
      }
    });

    const totalWords = cleanOriginal.split(/\s+/).length;
    // Accuracy = (Total - Errors) / Total
    // Clamp between 0 and 100
    let rawAccuracy = ((totalWords - errorCount) / totalWords) * 100;
    if (rawAccuracy < 0) rawAccuracy = 0;
    const accuracy = parseFloat(rawAccuracy.toFixed(2));

    setScore({ accuracy, errors: errorCount, wpm: typingSpeedWPM });
    setPhase('result');

    // 3. Save Data
    if (user) {
      setIsSaving(true);
      try {
        await saveStenoProgress({
          exercise_id: exercise.id,
          accuracy: accuracy,
          errors: errorCount,
          user_transcript: userInput
        });
      } catch (err) {
        console.error("Failed to save progress", err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // --- Diff Visualizer (Memoized) ---
  const diffVisualizer = useMemo(() => {
    if (phase !== 'result') return null;

    const diff = diffWords(exercise.transcript, userInput);
    
    return (
      <div className="leading-loose text-lg font-serif tracking-wide text-gray-800">
        {diff.map((part, index) => {
          if (part.added) {
            // Mistake: User typed extra stuff
            return (
              <span key={index} className="bg-red-100 text-red-600 line-through decoration-red-400 mx-1 px-1 rounded decoration-2" title="Extra text">
                {part.value}
              </span>
            );
          }
          if (part.removed) {
            // Mistake: User missed this text
            return (
              <span key={index} className="bg-green-100 text-green-700 font-semibold mx-1 px-1 rounded border-b-2 border-green-300" title="Missing text">
                {part.value}
              </span>
            );
          }
          // Correct text
          return <span key={index} className="text-gray-600">{part.value}</span>;
        })}
      </div>
    );
  }, [phase, exercise.transcript, userInput]);


  // ==========================================
  // VIEW 1: LISTENING PHASE
  // ==========================================
  if (phase === 'listening') {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-blue-100 text-blue-700 rounded-full mb-6">
             <PenTool className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{exercise.title}</h1>
          <p className="text-gray-500 text-xl max-w-2xl mx-auto">
            Take out your notebook. Listen to the dictation and write your shorthand notes. Do not type yet.
          </p>
        </div>

        {/* Audio Player Card */}
        <Card className="shadow-xl border-blue-100 bg-white overflow-hidden max-w-2xl mx-auto">
           {/* Progress Bar Top */}
           <div className="h-2 bg-gray-100 w-full">
              <div 
                className="h-full bg-blue-600 transition-all duration-300 ease-linear"
                style={{ width: `${audioProgress}%` }}
              />
           </div>
           
           <CardContent className="p-12 flex flex-col items-center justify-center gap-8">
              {/* Speed Indicator */}
              <div className="flex flex-col items-center">
                <span className="text-6xl font-mono text-gray-800 font-bold tracking-tight">
                    {exercise.wpm}
                </span>
                <span className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2">Words Per Minute</span>
              </div>
              
              {/* Play Button */}
              <button 
                onClick={togglePlay}
                className="w-28 h-28 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-all active:scale-95 group"
              >
                {isPlaying ? (
                    <Pause className="w-10 h-10 fill-current" />
                ) : (
                    <Play className="w-10 h-10 ml-2 fill-current group-hover:scale-110 transition-transform" />
                )}
              </button>
              
              <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                <Volume2 className="w-4 h-4" />
                {isPlaying ? "Dictation in Progress..." : "Click to Start Audio"}
              </div>
           </CardContent>
        </Card>

        {/* Action Bar */}
        <div className="mt-12 flex justify-center">
           <Button 
             onClick={startTypingPhase} 
             size="lg" 
             className="gap-2 text-lg h-14 px-10 rounded-full shadow-lg hover:shadow-xl transition-all"
           >
             I have finished writing <ChevronRight className="w-5 h-5" />
           </Button>
        </div>

        {/* Hidden Audio Element */}
        <audio 
            ref={audioRef} 
            src={exercise.audio_url} 
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleAudioEnd}
        />
      </div>
    );
  }

  // ==========================================
  // VIEW 2: TYPING PHASE
  // ==========================================
  if (phase === 'typing') {
    return (
      <div className="max-w-6xl mx-auto py-6 px-4 min-h-screen flex flex-col">
        
        {/* Sticky Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 sticky top-20 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-gray-200 z-40 shadow-sm gap-4">
           
           <div className="flex items-center gap-4">
             <div className="p-3 bg-purple-100 text-purple-700 rounded-lg hidden md:block">
                <Keyboard className="w-6 h-6" />
             </div>
             <div>
                <h2 className="font-bold text-gray-800 text-lg">Transcribing...</h2>
                <p className="text-sm text-gray-500">Read your notes and type here.</p>
             </div>
           </div>
           
           <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
             {/* Mini Audio Player for Review */}
             <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
                <button onClick={togglePlay} className="hover:text-blue-600 text-gray-600 transition-colors">
                   {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
                <div className="text-xs font-mono text-gray-500 w-10">
                    {audioRef.current ? formatTime(audioRef.current.currentTime) : "0:00"}
                </div>
             </div>
             
             <Button 
                onClick={calculateResult} 
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md"
             >
                Finish & Check <CheckCircle className="w-5 h-5 ml-2" />
             </Button>
           </div>
        </div>

        {/* Main Typing Area */}
        <div className="flex-1 relative">
          <Textarea 
             autoFocus
             value={userInput}
             onChange={(e) => setUserInput(e.target.value)}
             placeholder="Start typing your transcription here..."
             className="w-full h-[65vh] p-8 text-xl leading-relaxed font-serif resize-none border-gray-200 shadow-inner bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all rounded-xl"
             spellCheck={false}
          />
        </div>

        {/* Keep audio mounted so it doesn't reset position */}
        <audio 
            ref={audioRef} 
            src={exercise.audio_url} 
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
        />
      </div>
    );
  }

  // ==========================================
  // VIEW 3: RESULT PHASE
  // ==========================================
  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-in zoom-in-95 duration-500">
       
       <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-500" /> Performance Report
            </h1>
            <p className="text-gray-500 mt-2">Here is how you performed on "{exercise.title}"</p>
          </div>
          
          <div className="flex gap-3">
             <Button variant="outline" onClick={() => router.push('/steno')}>
                Back to Dashboard
             </Button>
             <Button onClick={() => window.location.reload()}>
                <RotateCcw className="w-4 h-4 mr-2" /> Retry Exercise
             </Button>
          </div>
       </div>

       {/* --- SCORE CARDS --- */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Accuracy Card */}
          <Card className={`overflow-hidden border-t-4 shadow-md ${score.accuracy >= 95 ? 'border-t-green-500' : score.accuracy >= 80 ? 'border-t-yellow-500' : 'border-t-red-500'}`}>
             <CardContent className="p-6 text-center relative">
                <div className="text-5xl font-bold text-gray-900 mb-2">{score.accuracy}%</div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Accuracy</div>
                {isSaving && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-xs text-gray-400">
                        <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                    </div>
                )}
             </CardContent>
          </Card>

          {/* Typing Speed Card */}
          <Card className="overflow-hidden border-t-4 border-t-blue-500 shadow-md">
             <CardContent className="p-6 text-center">
                <div className="text-5xl font-bold text-gray-900 mb-2">{score.wpm}</div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Typing WPM</div>
             </CardContent>
          </Card>

          {/* Errors Card */}
          <Card className="overflow-hidden border-t-4 border-t-red-500 shadow-md">
             <CardContent className="p-6 text-center">
                <div className="text-5xl font-bold text-gray-900 mb-2">{score.errors}</div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Errors</div>
             </CardContent>
          </Card>
       </div>

       {/* --- DETAILED ANALYSIS --- */}
       <Card className="shadow-lg border border-gray-200 overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-4 px-6 flex flex-row items-center justify-between">
             <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gray-500" /> Mistake Analysis
             </CardTitle>
             
             {/* Legend */}
             <div className="flex gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-red-100 border border-red-300 rounded-sm"></span> 
                    <span className="text-gray-600">Extra/Wrong</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-green-100 border border-green-300 rounded-sm"></span> 
                    <span className="text-gray-600">Missed</span>
                </div>
             </div>
          </CardHeader>
          
          <CardContent className="p-8 bg-white min-h-[300px]">
             {diffVisualizer}
          </CardContent>
       </Card>

    </div>
  );
}