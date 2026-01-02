"use client";
import React from "react";
import Link from "next/link";
import { 
  RocketIcon, 
  CheckCircledIcon, 
  ReaderIcon, 
  LayersIcon 
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

const PublicLanding = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-6">
            <RocketIcon className="w-4 h-4" />
            <span>A 100% Free Learning Initiative</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
            Unlock Your <span className="text-blue-600">Career Path</span> with Preparely
          </h1>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Stop wandering. Get access to curated, high-quality resources and a 
            step-by-step roadmap to crack your dream exams and secure a path-specified job.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="px-10 py-7 text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200">
                Start Learning Now — It's Free
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="px-10 py-7 text-lg border-slate-200 text-slate-700">
                Explore Resources
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Feature 1 */}
          <div className="space-y-4">
            <div className="p-3 bg-teal-100 text-teal-700 rounded-2xl w-fit">
              <LayersIcon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Path-Specified Jobs</h3>
            <p className="text-slate-600 leading-relaxed">
              We don't just provide courses; we provide roadmaps. Learn exactly 
              what is required for the specific job profile you are targeting.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="space-y-4">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl w-fit">
              <ReaderIcon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Curated Resources</h3>
            <p className="text-slate-600 leading-relaxed">
              We've scanned thousands of materials to give you only the 
              <strong> "bestest" resources </strong>. No more wasting time on irrelevant content.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="space-y-4">
            <div className="p-3 bg-orange-100 text-orange-700 rounded-2xl w-fit">
              <CheckCircledIcon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Zero Cost, Zero Ads</h3>
            <p className="text-slate-600 leading-relaxed">
              Preparely is a free initiative. Our mission is to democratize 
              education so that financial status never hinders your growth.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-slate-900 py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Trusted by 10,000+ Students Daily</h2>
        <p className="text-slate-400 mb-0">Join the community and start your journey today.</p>
      </section>
    </div>
  );
};

export default PublicLanding;