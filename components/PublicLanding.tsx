"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  Mic, 
  ArrowRight,
  Newspaper,
  TrendingUp,
  Users
} from "lucide-react";

export default function PublicLanding() {
  // Dummy Articles Data
  const articles = [
    {
      id: 1,
      tag: "Career Guide",
      title: "SSC Steno 2024: Complete Roadmap",
      desc: "A step-by-step guide to cracking the Grade C & D exams in your first attempt.",
      date: "2 Days ago",
      readTime: "5 min read"
    },
    {
      id: 2,
      tag: "Skill Building",
      title: "How to reach 100 WPM in Shorthand",
      desc: "Proven techniques to break your speed plateau and improve accuracy.",
      date: "4 Days ago",
      readTime: "8 min read"
    },
    {
      id: 3,
      tag: "Job Alert",
      title: "High Court PA Recruitment Notification",
      desc: "New vacancies released for Personal Assistant posts. Check eligibility now.",
      date: "1 Week ago",
      readTime: "3 min read"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* --- HERO SECTION --- */}
      <section className="relative px-6 py-24 lg:py-32 bg-gradient-to-b from-amber-50/80 via-white to-white overflow-hidden">
        {/* Background blobs for visual interest */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-orange-100/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-sm font-bold mb-8 shadow-sm">
            <Rocket className="w-4 h-4" />
            <span>Premium Education. Zero Cost.</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
            Master Your Skills. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
              Crack the Exam.
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Get access to professional <strong>Stenography Dictations</strong>, curated courses, and job notifications without paying a rupee.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-10 h-14 text-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-100 hover:shadow-amber-200 transition-all font-bold">
                Start Learning Free
              </Button>
            </Link>
            <Link href="/stenography" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-10 h-14 text-lg border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium">
                Try Dictation Tool
              </Button>
            </Link>
          </div>
          
          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-slate-400 font-medium">
             <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> No Credit Card</span>
             <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Unlimited Access</span>
          </div>
        </div>
      </section>

      {/* --- FEATURE SPOTLIGHT: STENOGRAPHY --- */}
      <section className="py-20 px-4 bg-slate-900 text-white relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
           <div>
              <div className="inline-block p-3 bg-slate-800 rounded-xl mb-6 border border-slate-700">
                 <Mic className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                 Professional Steno Dictation Library
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                 Practice with our advanced audio player designed for stenographers. Adjust speeds, track accuracy, and view transcripts in real-time.
              </p>
              
              <ul className="space-y-4 mb-8">
                 {[
                    "Dictations from 60 WPM to 120 WPM",
                    "Real-time Accuracy Analysis",
                    "Voice of Professional Readers"
                 ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                       <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                       </div>
                       <span className="font-medium text-slate-200">{item}</span>
                    </li>
                 ))}
              </ul>

              <Link href="/stenography">
                 <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold h-12 px-8">
                    Open Library <ArrowRight className="ml-2 w-4 h-4" />
                 </Button>
              </Link>
           </div>
           
           {/* Visual Representation of the Tool */}
           <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl">
                  {/* Mock UI of Player */}
                  <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                            <Mic className="w-5 h-5 text-white" />
                         </div>
                         <div>
                            <div className="text-sm font-bold text-white">Legal Dictation #42</div>
                            <div className="text-xs text-slate-400">80 WPM • Hard</div>
                         </div>
                      </div>
                      <Badge className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-0">Premium</Badge>
                  </div>
                  <div className="space-y-3">
                      <div className="h-2 bg-slate-700 rounded-full w-3/4"></div>
                      <div className="h-2 bg-slate-700 rounded-full w-full"></div>
                      <div className="h-2 bg-slate-700 rounded-full w-5/6"></div>
                      <div className="h-2 bg-slate-700 rounded-full w-1/2"></div>
                  </div>
                  <div className="mt-6 flex justify-between items-center text-xs text-slate-500">
                      <span>02:14 / 05:00</span>
                      <div className="flex gap-2">
                         <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center"><ArrowRight className="w-4 h-4 rotate-180" /></div>
                         <div className="w-8 h-8 rounded bg-amber-500 text-white flex items-center justify-center font-bold">||</div>
                         <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center"><ArrowRight className="w-4 h-4" /></div>
                      </div>
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- LATEST RESOURCES SECTION (Dummy Content) --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
           <Badge variant="outline" className="mb-4 text-amber-600 border-amber-200 bg-amber-50">New Updates</Badge>
           <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Latest from Preparely</h2>
           <p className="text-slate-500 max-w-2xl mx-auto">Stay updated with the latest exam notifications, preparation strategies, and learning resources.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {articles.map((article) => (
             <Link href="/login" key={article.id} className="group">
                <article className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-amber-100/50 hover:border-amber-200 transition-all duration-300 flex flex-col overflow-hidden">
                   <div className="p-6 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">{article.tag}</span>
                         <span className="text-xs text-slate-400">{article.date}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
                         {article.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                         {article.desc}
                      </p>
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                         <span className="text-slate-400">{article.readTime}</span>
                         <span className="text-amber-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read Article <ArrowRight className="w-4 h-4" />
                         </span>
                      </div>
                   </div>
                </article>
             </Link>
           ))}
        </div>
        
        <div className="text-center mt-12">
           <Link href="/login">
             <Button variant="outline" className="border-slate-300 text-slate-600 hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50">
                View All Articles
             </Button>
           </Link>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-20 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Path-Specified Jobs</h3>
              <p className="text-slate-500 leading-relaxed">
                We don't just provide courses; we provide roadmaps. Learn exactly 
                what is required for the specific job profile you are targeting.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Curated Resources</h3>
              <p className="text-slate-500 leading-relaxed">
                We've scanned thousands of materials to give you only the 
                <strong> "bestest" resources</strong>. No more wasting time on irrelevant content.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Zero Cost, Zero Ads</h3>
              <p className="text-slate-500 leading-relaxed">
                Preparely is a free initiative. Our mission is to democratize 
                education so that financial status never hinders your growth.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- FINAL CTA / SOCIAL PROOF --- */}
      <section className="py-24 text-center px-4 bg-white">
         <div className="max-w-3xl mx-auto">
            <div className="flex justify-center -space-x-4 mb-6">
               {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                     <Users className="w-5 h-5" />
                  </div>
               ))}
               <div className="w-12 h-12 rounded-full border-4 border-white bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600">
                  +10k
               </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
               Join 10,000+ Students Today
            </h2>
            <p className="text-lg text-slate-500 mb-10">
               Your dream job is waiting. Don't let a lack of resources hold you back.
            </p>
            <Link href="/login">
               <Button size="lg" className="px-12 h-14 text-lg bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xl shadow-amber-200 hover:-translate-y-1 transition-transform">
                  Create Free Account
               </Button>
            </Link>
         </div>
      </section>

    </div>
  );
}