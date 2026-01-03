import React from "react";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase";
import { Megaphone, ArrowUpRight, CalendarClock } from "lucide-react";

// --- CSS FOR MARQUEE ANIMATION ---
const marqueeStyle = {
  animation: " linear infinite",
};

const keyframes = `
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .pause-on-hover:hover {
    animation-play-state: paused;
  }
`;

export default async function Newsticker() {
  const supabase = await createSupabaseServerClient();

  // 1. Fetch News
  const { data: rawNews, error } = await supabase
    .from("news")
    .select(`
      id,
      title,
      image,
      news_link,
      created_at,
      author (
        name,
        image
      )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !rawNews || rawNews.length === 0) {
    return null;
  }

  // --- THE FIX: SANITIZE DATA ---
  // We use JSON.parse(JSON.stringify(...)) to strip out any 
  // hidden classes, prototypes, or complex Date objects that crash Next.js
  const newsItems = JSON.parse(JSON.stringify(rawNews));

  // 2. Duplicate Data for Seamless Infinite Loop
  const seamlessList = [...newsItems, ...newsItems];

  return (
    <div className="w-full bg-white border-y border-amber-100 relative overflow-hidden h-16 md:h-20 flex items-center">
      {/* Inject Animation Styles */}
      <style>{keyframes}</style>

      {/* --- LABEL --- */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center bg-amber-500 px-4 md:px-6 shadow-lg shadow-amber-200/50">
        <div className="flex flex-col items-center justify-center text-white">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
            <span className="font-black text-xs md:text-sm uppercase tracking-wider">
              Latest
            </span>
          </div>
          <span className="text-[10px] font-medium opacity-90 hidden md:block">
            Updates
          </span>
        </div>
        <div className="absolute top-0 right-0 -mr-4 w-0 h-0 border-t-[64px] border-t-amber-500 border-r-[20px] border-r-transparent md:border-t-[80px]"></div>
      </div>

      {/* --- MARQUEE TRACK --- */}
      <div className="flex items-center w-full overflow-hidden ml-24 md:ml-32 mask-image-gradient">
        <div 
          className="flex items-center gap-6 md:gap-10 whitespace-nowrap will-change-transform pause-on-hover py-2"
          style={marqueeStyle}
        >
          {seamlessList.map((item: any, index: number) => (
            <Link 
              key={`${item.id}-${index}`} 
              href={item.news_link || "#"} 
              target="_blank" 
              className="group flex items-center gap-3 pr-4 transition-opacity hover:opacity-100 opacity-80"
            >
              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                {item.image ? (
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-amber-50 flex items-center justify-center">
                    <span className="text-amber-300 font-bold text-xs">NEWS</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center">
                <h4 className="text-xs md:text-sm font-bold text-gray-800 group-hover:text-amber-600 transition-colors flex items-center gap-1">
                  {item.title}
                  <ArrowUpRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  {item.author?.name && (
                    <span className="font-medium text-gray-600">
                      By {item.author.name}
                    </span>
                  )}
                  {/* Ensure date is handled as a string */}
                  <span className="flex items-center gap-1">
                     <CalendarClock className="w-3 h-3" />
                     {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-gradient-to-b from-transparent via-amber-200 to-transparent ml-4 opacity-50"></div>
            </Link>
          ))}
        </div>
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
    </div>
  );
}