"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { readmoreblog } from "@/lib/actions/blog";
import { IBlog } from "@/lib/types";
import Navbar from "@/app/navbar/navbar";
import { 
    Bell, Calendar, ChevronRight, FileText, Newspaper, 
    Search, TrendingUp, Mail, Briefcase, Award, 
    CheckCircle2, BookOpen, FileCheck, HelpCircle, Users
} from "lucide-react";

// --- 1. MOCK DATA (Non-Blog Data) ---
// In a real app, these would come from your backend API
const SARKARI_DATA = {
    results: [
        { title: "UPSC CSE 2024 Final Result Declared", link: "/result/upsc-cse-2024", isNew: true },
        { title: "Bihar STET 2024 Score Card", link: "/result/bihar-stet", isNew: true },
        { title: "SSC CGL 2023 Tier II Marks", link: "/result/ssc-cgl-marks", isNew: false },
        { title: "RRB NTPC Level 5 Final Panel", link: "/result/rrb-ntpc", isNew: false },
        { title: "CBSE Class 10th Compartment Result", link: "/result/cbse-10", isNew: false },
        { title: "UP Police Constable Re-Exam Result", link: "/result/up-police", isNew: false },
    ],
    admitCards: [
        { title: "SSC CHSL Tier 1 Admit Card 2024", link: "/admit/ssc-chsl", isNew: true },
        { title: "IBPS Clerk Prelims Hall Ticket", link: "/admit/ibps-clerk", isNew: true },
        { title: "CRPF Tradesman PET/PST Admit Card", link: "/admit/crpf", isNew: false },
        { title: "NTA NEET UG 2024 Re-Exam Call Letter", link: "/admit/neet-ug", isNew: false },
        { title: "Rajasthan High Court LDC Admit Card", link: "/admit/raj-hc", isNew: false },
    ],
    latestJobs: [
        { title: "Railway RPF Constable & SI Recruitment 2024", link: "/job/rpf-2024", isNew: true },
        { title: "BPSC Head Master Online Form 2024", link: "/job/bpsc-headmaster", isNew: true },
        { title: "Indian Navy Agniveer SSR/MR 02/2024", link: "/job/navy-agniveer", isNew: true },
        { title: "Air Force AFCAT 02/2024 Apply Online", link: "/job/afcat", isNew: false },
        { title: "SSC MTS & Havaldar Notification 2024", link: "/job/ssc-mts", isNew: false },
        { title: "UP Panchayat Sahayak Recruitment", link: "/job/up-panchayat", isNew: false },
    ]
};

// --- UTILITIES ---
function extractImageUrlsFromMarkdown(markdown: string): string[] {
    const imageUrls: string[] = [];
    const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const htmlImageRegex = /<img[^>]+src="([^">]+)"/g;
    let match: RegExpExecArray | null;
    while ((match = markdownImageRegex.exec(markdown))) imageUrls.push(match[2]);
    while ((match = htmlImageRegex.exec(markdown))) imageUrls.push(match[1]);
    return imageUrls;
}

const placeholderImages = [
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=300&fit=crop",
    "https://images.unsplash.com/photo-1541872703-74c5963631df?w=600&h=300&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=300&fit=crop",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=300&fit=crop",
];

// --- COMPONENTS ---

const NewsTicker = () => (
    <div className="bg-blue-950 text-white py-2 overflow-hidden flex items-center relative z-20 border-b border-blue-800">
        <div className="bg-red-600 px-4 py-1.5 font-bold text-xs uppercase tracking-wider ml-4 z-10 absolute left-0 top-1/2 -translate-y-1/2 shadow-lg skew-x-[-10deg]">
            <span className="block skew-x-[10deg]">Latest Updates</span>
        </div>
        <div className="whitespace-nowrap animate-marquee flex gap-10 pl-44 md:pl-48">
            <span className="flex items-center text-sm font-medium hover:text-yellow-400 cursor-pointer transition-colors"><TrendingUp className="w-4 h-4 mr-2 text-yellow-400"/> New Sarkari Yojna announced for 2024 applicants.</span>
            <span className="flex items-center text-sm font-medium hover:text-yellow-400 cursor-pointer transition-colors"><TrendingUp className="w-4 h-4 mr-2 text-yellow-400"/> Admit cards released for State Police Exam.</span>
            <span className="flex items-center text-sm font-medium hover:text-yellow-400 cursor-pointer transition-colors"><TrendingUp className="w-4 h-4 mr-2 text-yellow-400"/> Last date extended for Scholarship application.</span>
        </div>
    </div>
);

// New Component: The "Big Three" Column Link List
const CategoryColumn = ({ title, items, colorClass, icon: Icon }: { title: string, items: any[], colorClass: string, icon: any }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
        <div className={`${colorClass} px-5 py-4 border-b border-gray-100 flex items-center justify-between`}>
            <h3 className="font-bold text-lg text-white flex items-center">
                <Icon className="w-5 h-5 mr-2 opacity-90" />
                {title}
            </h3>
            <span className="bg-white/20 text-white text-[10px] px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                Live
            </span>
        </div>
        <div className="p-2 flex-grow">
            <ul className="space-y-1">
                {items.map((item, i) => (
                    <li key={i}>
                        <Link href={item.link} className="flex items-start p-2.5 hover:bg-slate-50 rounded-lg group transition-all duration-200 border border-transparent hover:border-gray-100">
                            <ChevronRight className="w-4 h-4 text-gray-400 mt-1 mr-2 flex-shrink-0 group-hover:text-blue-600 transition-colors" />
                            <div className="flex-1">
                                <span className="text-[15px] text-gray-700 font-medium group-hover:text-blue-700 leading-snug block">
                                    {item.title}
                                </span>
                            </div>
                            {item.isNew && (
                                <span className="ml-2 flex-shrink-0 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">
                                    New
                                </span>
                            )}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
            <Link href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                View All {title}
            </Link>
        </div>
    </div>
);

// New Component: Quick Links Grid
const QuickActions = () => {
    const actions = [
        { label: "Answer Key", icon: FileCheck, color: "bg-purple-100 text-purple-700" },
        { label: "Syllabus", icon: BookOpen, color: "bg-indigo-100 text-indigo-700" },
        { label: "Admission", icon: Users, color: "bg-green-100 text-green-700" },
        { label: "Important", icon: HelpCircle, color: "bg-orange-100 text-orange-700" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {actions.map((action, i) => (
                <Link key={i} href="#" className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center justify-between group">
                    <span className="font-semibold text-gray-700 group-hover:text-blue-700">{action.label}</span>
                    <div className={`${action.color} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-5 h-5" />
                    </div>
                </Link>
            ))}
        </div>
    );
};

// New Component: Stats Banner
const StatsBanner = () => (
    <div className="bg-white border-y border-gray-200 py-6 mb-12">
        <div className="container mx-auto px-4 flex flex-wrap justify-around gap-6 text-center">
            <div>
                <div className="text-3xl font-black text-blue-600">240+</div>
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Active Jobs</div>
            </div>
            <div>
                <div className="text-3xl font-black text-green-600">1.2k</div>
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Results Out</div>
            </div>
            <div>
                <div className="text-3xl font-black text-orange-600">5M+</div>
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Daily Visitors</div>
            </div>
        </div>
    </div>
);

const SidebarWidget = ({ title, items, icon: Icon }: { title: string, items: string[], icon: any }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center text-sm uppercase tracking-wide">
                <Icon className="w-4 h-4 mr-2 text-blue-600" />
                {title}
            </h3>
        </div>
        <ul className="divide-y divide-gray-100">
            {items.map((item, i) => (
                <li key={i} className="p-3 hover:bg-blue-50 transition-colors cursor-pointer group">
                    <div className="flex items-start">
                        <ChevronRight className="w-4 h-4 text-gray-400 mt-1 mr-1 group-hover:text-blue-500" />
                        <span className="text-sm text-gray-700 group-hover:text-blue-700 font-medium">{item}</span>
                    </div>
                </li>
            ))}
        </ul>
    </div>
);

const Newsletter = () => (
    <div className="bg-blue-900 rounded-2xl p-8 text-center text-white relative overflow-hidden my-12 shadow-xl isolate">
        <div className="relative z-10 max-w-2xl mx-auto">
            <Mail className="w-10 h-10 mx-auto mb-4 text-blue-300" />
            <h2 className="text-2xl font-bold mb-2">Subscribe to Alerts</h2>
            <p className="text-blue-100 mb-6 text-sm">Get the latest Sarkari Result, Job & Admit Card updates directly to your inbox.</p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input 
                    type="email" 
                    placeholder="Enter email address" 
                    className="flex-1 px-4 py-2.5 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors shadow-lg">
                    Subscribe
                </button>
            </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
    </div>
);

// --- MAIN PAGE ---

export default function Home() {
    const [blogs, setBlogs] = useState<IBlog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const { data } = await readmoreblog();
                if (data && data.length > 0) {
                    setBlogs(data as IBlog[]);
                }
            } catch (error) {
                console.error("Error fetching blogs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    const recentBlogs = blogs.length > 0 ? blogs.slice(0, 6) : [];

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
            <Navbar />
            
            <NewsTicker />

            <div className="container mx-auto px-4 py-8">
                
                {/* Search & Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                            <span className="text-blue-700">Sarkari</span> Update
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">India's No. 1 Education & Job Portal</p>
                    </div>
                    <div className="relative w-full md:w-96">
                        <input type="text" placeholder="Search for jobs, results..." className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {/* THE BIG THREE (Core Sarkari Components) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    <CategoryColumn 
                        title="Result" 
                        items={SARKARI_DATA.results} 
                        colorClass="bg-gradient-to-r from-pink-600 to-rose-600"
                        icon={Award}
                    />
                    <CategoryColumn 
                        title="Admit Card" 
                        items={SARKARI_DATA.admitCards} 
                        colorClass="bg-gradient-to-r from-blue-600 to-indigo-600"
                        icon={FileText}
                    />
                    <CategoryColumn 
                        title="Latest Jobs" 
                        items={SARKARI_DATA.latestJobs} 
                        colorClass="bg-gradient-to-r from-emerald-600 to-teal-600"
                        icon={Briefcase}
                    />
                </div>

                {/* Quick Actions Grid */}
                <QuickActions />

            </div>

            {/* Stats Separator */}
            <StatsBanner />

            <div className="container mx-auto px-4 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* LEFT: Articles/News Feed (Spans 8) */}
                    <div className="lg:col-span-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 border-l-4 border-orange-500 pl-3">
                                Detailed Notifications & Articles
                            </h2>
                            <Link href="/blog" className="text-sm font-semibold text-blue-600 hover:text-blue-800">View All</Link>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1,2,3,4].map(i => <div key={i} className="h-72 bg-gray-200 rounded-xl animate-pulse"></div>)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {recentBlogs.map((blog, index) => {
                                    const images = extractImageUrlsFromMarkdown(blog.content);
                                    const displayImage = images.length > 0 ? images[0] : placeholderImages[index % placeholderImages.length];

                                    return (
                                        <Link key={blog.slug || index} href={`/blog/${blog.slug}`} className="group flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                            <div className="relative h-48 w-full overflow-hidden">
                                                <Image
                                                    src={displayImage}
                                                    alt={blog.title ? String(blog.title) : "Blog image"}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                            </div>
                                            <div className="p-5 flex flex-col flex-grow">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Scheme</span>
                                                    <span className="text-xs text-gray-400 flex items-center"><Calendar className="w-3 h-3 mr-1"/>{new Date(blog.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 leading-tight group-hover:text-blue-700">
                                                    {blog.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                                    Get full details about eligibility criteria, important dates, and application fees.
                                                </p>
                                                <div className="mt-auto flex items-center text-orange-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                                                    Read Full Article <ChevronRight className="w-4 h-4 ml-1" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Sidebar (Spans 4) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Telegram Widget */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white text-center shadow-lg transform transition hover:scale-[1.02]">
                            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                                <SendIcon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-lg mb-1">Join Telegram Channel</h3>
                            <p className="text-blue-100 text-sm mb-4">Get Real-time updates on your phone.</p>
                            <button className="bg-white text-blue-600 font-bold py-2 px-6 rounded-full text-sm w-full hover:bg-blue-50 transition-colors shadow-sm">
                                Join Now
                            </button>
                        </div>

                        <div className="sticky top-4 space-y-6">
                            <SidebarWidget 
                                title="Important Links" 
                                icon={FileCheck}
                                items={["UP Scholarship Status 2024", "Aadhar Card Download", "Pan Card Online Apply", "Voter ID Status Check"]} 
                            />
                            
                            <SidebarWidget 
                                title="Upcoming Exams" 
                                icon={Calendar}
                                items={["UPSC Prelims (26 May)", "SSC CGL Tier 1 (July)", "IBPS RRB Office Asst (Aug)"]} 
                            />
                        </div>
                    </div>

                </div>

                <Newsletter />
                
            </div>
        </div>
    );
}

// Simple Icon for Telegram Widget
const SendIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);