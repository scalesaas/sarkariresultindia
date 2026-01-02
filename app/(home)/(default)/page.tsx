"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ChevronRight, 
  Trophy, 
  Users, 
  PlayCircle, 
  Star 
} from 'lucide-react';
const EXAM_CATEGORIES = ["UPSC", "SSC", "State PSC", "Teaching", "Railways", "Defence", "Banking"];
import Navbar from '@/app/navbar/navbar';

const EXAMS = [
  { id: 'ias', name: 'IAS Exam', category: 'UPSC', icon: '🏛️' },
  { id: 'upsc-csel', name: 'UPSC CSE', category: 'UPSC', icon: '⚖️' },
  { id: 'ssc-cgl', name: 'SSC CGL', category: 'SSC', icon: '📝' },
  { id: 'rrb-ntpc', name: 'RRB NTPC', category: 'Railways', icon: '🚆' },
  { id: 'bank-po', name: 'IBPS PO', category: 'Banking', icon: '💰' },
  { id: 'nda', name: 'NDA', category: 'Defence', icon: '🎖️' },
];

const TRENDING_TESTS = [
  { id: 1, title: 'RRB NTPC (CBT 1 + CBT 2) 2025', category: 'Railways', tests: 873, attempts: '100k+', rating: 4.2 },
  { id: 2, title: 'SSC CGL Tier I + II 2025', category: 'SSC', tests: 1868, attempts: '58k+', rating: 4.7 },
];

export default function PreparelyLanding() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Toggle for testing
  const [activeTab, setActiveTab] = useState("UPSC");

  // Logic: Redirect to course/resource page
  const handleExamSelect = (examId : any) => {
    router.push(`/${examId}`);
  };
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      {/* 1. Header Navigation */}
      {/* <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-blue-600 tracking-tight">Preparely</h1>
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-blue-600">Explore Exams</a>
            <a href="#" className="hover:text-blue-600">Test Series</a>
            <a href="#" className="hover:text-blue-600">Quizzes</a>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search exams..." 
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button 
            onClick={() => setIsLoggedIn(!isLoggedIn)}
            className="px-5 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 font-semibold text-sm transition-all"
          >
            {isLoggedIn ? "Logout" : "Login / Register"}
          </button>
        </div>
      </nav> */}
      <Navbar />

      {/* 2. Banner Notification */}
      <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium flex justify-center items-center gap-3">
        All Exam Test series for 1 year @ ₹349 only
        <button className="bg-yellow-400 text-blue-900 px-3 py-1 rounded-md text-xs font-bold uppercase">Enroll Now</button>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {!isLoggedIn ? (
          /* Logged Out View */
          <div className="text-center py-20">
            <h2 className="text-4xl font-extrabold mb-4">Master Your Competitive Exams</h2>
            <p className="text-gray-500 max-w-xl mx-auto mb-8">Join 1M+ students preparing for UPSC, SSC, and Banking exams with India's most trusted resource platform.</p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700">Get Started for Free</button>
          </div>
        ) : (
          /* Logged In View: Main Dashboard */
          <>
            {/* Exam Selection Section */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6">Choose your exam</h2>
              
              {/* Category Tabs */}
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {EXAM_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
                      activeTab === cat 
                      ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Exam Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {EXAMS.filter(e => e.category === activeTab).map((exam) => (
                  <div 
                    key={exam.id}
                    onClick={() => handleExamSelect(exam.id)}
                    className="flex items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer transition-all group"
                  >
                    <span className="text-2xl mr-4 group-hover:scale-110 transition-transform">{exam.icon}</span>
                    <span className="font-semibold text-slate-700">{exam.name}</span>
                    <ChevronRight className="ml-auto h-4 w-4 text-gray-300 group-hover:text-blue-500" />
                  </div>
                ))}
              </div>
            </section>

            {/* Trending Test Series */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Trending Test Series</h2>
                <button className="text-blue-600 text-sm font-bold hover:underline">View All</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TRENDING_TESTS.map((test) => (
                  <div key={test.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-gray-100 p-2 rounded-lg text-lg">📚</div>
                        <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-1 rounded text-slate-500">{test.category}</span>
                      </div>
                      <h3 className="font-bold text-lg leading-tight mb-3">{test.title}</h3>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                        <span className="flex items-center gap-1"><PlayCircle className="h-3 w-3" /> {test.tests} Tests</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {test.attempts} Attempts</span>
                        <span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> {test.rating}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => handleExamSelect(test.id)}
                        className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-sm font-bold rounded-xl transition-colors"
                      >
                        View Test Series
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}