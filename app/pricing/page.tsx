import React from "react";
import { createSupabaseServerClient } from "@/lib/supabase";
import PricingCard from "./PricingComponent";
import { 
  Star, 
  Zap, 
  BookOpen, 
  Briefcase, 
  Newspaper, 
  Mic,
  Coffee,
} from "lucide-react";

// Server Component (No "use client")
export default async function PricingPage() {
  // 1. Fetch User Session on Server
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans">
      
      {/* --- HERO SECTION --- */}
      <div className="bg-slate-900 text-white pt-24 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
           <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
           <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700 text-blue-300 text-sm font-medium mb-6">
            <Star className="w-4 h-4 fill-current" /> Premium Membership
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Invest in Your Future. <span className="text-blue-400">Not Your Lunch.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            Skip one pizza a month and unlock our entire library of steno dictations, courses, and job alerts.
          </p>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20 pb-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          
          {/* 1. Client Component: Pricing Card */}
          {/* We pass the user object as a prop */}
          <PricingCard user={user} />

          {/* 2. Server Rendered: "Why it's affordable" Logic */}
          <div className="flex-1 lg:mt-8 max-w-md mx-auto lg:max-w-none">
             <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Why ₹300/month?</h2>
                <p className="text-slate-600 leading-relaxed">
                  We kept the price intentionally low. Instead of asking you to pay thousands upfront, we offer a flexible monthly plan. It's cheaper than your average weekend outing.
                </p>
             </div>

             {/* Comparison Visual */}
             <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-6">Let's put ₹300 in perspective:</h3>
                
                <div className="space-y-6">
                   <div className="flex items-center justify-between opacity-60">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                            <div className="text-xl font-bold">🍕</div>
                         </div>
                         <div>
                            <p className="font-semibold text-slate-700">1 Medium Pizza</p>
                            <p className="text-xs text-slate-500">Lasts 30 minutes</p>
                         </div>
                      </div>
                      <span className="font-bold text-slate-500 line-through">₹350+</span>
                   </div>

                   <div className="flex items-center justify-between relative bg-blue-50/50 p-2 rounded-lg border border-blue-100 -mx-2">
                       <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-600 rounded-full hidden lg:block"></div>
                      <div className="flex items-center gap-4 lg:pl-2">
                         <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md shadow-blue-200">
                            <Zap className="w-6 h-6 fill-current" />
                         </div>
                         <div>
                            <p className="font-bold text-slate-900">30 Days of Premium</p>
                            <p className="text-xs text-blue-600 font-medium">Invest in your career</p>
                         </div>
                      </div>
                      <span className="font-bold text-blue-600 text-xl">₹300</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* --- FEATURES GRID (Server Rendered) --- */}
      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">What do you get for ₹10/day?</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <Mic className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Steno Dictations</h3>
              <p className="text-sm text-slate-500">Unlimited high-speed audio dictations with real-time accuracy checking.</p>
           </div>
           
           <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Job Alerts</h3>
              <p className="text-sm text-slate-500">Priority alerts for Government and Private sector jobs.</p>
           </div>

           <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <Newspaper className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Premium News</h3>
              <p className="text-sm text-slate-500">Daily editorials and current affairs.</p>
           </div>

           <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Full Courses</h3>
              <p className="text-sm text-slate-500">Video courses on Typing, Shorthand, and Computer Basics.</p>
           </div>
        </div>
      </div>

    </div>
  );
}