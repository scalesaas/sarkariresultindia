"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { readmoreblog } from "@/lib/actions/blog";
import Navbar from "../navbar/navbar";
import { IBlog } from "@/lib/types";
import { Bell, Calendar, ChevronRight, FileText, Newspaper, Search, TrendingUp, Mail } from "lucide-react";

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
    "https://images.unsplash.com/photo-1541872703-74c5963631df?w=600&h=300&fit=crop", // Office/Gov feel
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=300&fit=crop",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=300&fit=crop", // Meeting
];

// --- SUB-COMPONENTS ---

const NewsTicker = () => (
    <div className="bg-blue-900 text-white py-2 overflow-hidden flex items-center relative z-20">
        <div className="bg-red-600 px-4 py-1 font-bold text-xs uppercase tracking-wider ml-4 z-10 absolute left-0 top-1/2 -translate-y-1/2 shadow-md">
            Latest Updates
        </div>
        <div className="whitespace-nowrap animate-marquee flex gap-10 pl-40">
            <span className="flex items-center text-sm"><TrendingUp className="w-4 h-4 mr-2 text-yellow-400"/> New Sarkari Yojna announced for 2024 applicants.</span>
            <span className="flex items-center text-sm"><TrendingUp className="w-4 h-4 mr-2 text-yellow-400"/> Admit cards released for State Police Exam.</span>
            <span className="flex items-center text-sm"><TrendingUp className="w-4 h-4 mr-2 text-yellow-400"/> Last date extended for Scholarship application.</span>
        </div>
    </div>
);

const SidebarWidget = ({ title, items, icon: Icon }: { title: string, items: string[], icon: any }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center">
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
                    {i === 0 && <span className="ml-5 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">New</span>}
                </li>
            ))}
        </ul>
    </div>
);

const Newsletter = () => (
    <div className="bg-gradient-to-r from-blue-900 to-slate-800 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden my-12 shadow-xl">
        <div className="relative z-10 max-w-2xl mx-auto">
            <Mail className="w-12 h-12 mx-auto mb-4 text-blue-300" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Get Sarkari Updates in Your Inbox</h2>
            <p className="text-blue-100 mb-8">Subscribe to our weekly newsletter to get the latest government job notifications, admit cards, and scheme details directly.</p>
            <div className="flex flex-col sm:flex-row gap-3">
                <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="flex-1 px-5 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg">
                    Subscribe
                </button>
            </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange-500 opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>
    </div>
);

// --- MAIN COMPONENT ---

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

    // Split content for layout
    const featuredBlog = blogs.length > 0 ? blogs[0] : null;
    const recentBlogs = blogs.length > 0 ? blogs.slice(1) : [];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            
            {/* Breaking News Ticker */}
            <NewsTicker />

            <div className="container mx-auto px-4 py-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-200 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Sarkari News & Updates</h1>
                        <p className="text-gray-500 mt-1">Your trusted source for Government Jobs, Schemes & Exam Results</p>
                    </div>
                    <div className="mt-4 md:mt-0 relative">
                        <input type="text" placeholder="Search news..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN (Content) - Spans 8 cols */}
                    <div className="lg:col-span-8">
                        
                        {/* Hero Section (Featured Post) */}
                        {featuredBlog && (
                            <Link href={`/blog/${featuredBlog.slug}`} className="group block mb-10">
                                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                                    <div className="relative h-[350px] w-full overflow-hidden">
                                        <div className="absolute top-4 left-4 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded uppercase z-10">
                                            Featured Scheme
                                        </div>
                                        {(() => {
                                            const images = extractImageUrlsFromMarkdown(featuredBlog.content);
                                            const img = images.length > 0 ? images[0] : placeholderImages[0];
                                            return (
                                                <Image 
                                                    src={img} alt={featuredBlog.title || "Featured"} fill 
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            );
                                        })()}
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                                            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> {new Date(featuredBlog.created_at).toDateString()}</span>
                                            <span className="flex items-center"><Newspaper className="w-4 h-4 mr-1"/> Govt. Scheme</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-3">
                                            {featuredBlog.title}
                                        </h2>
                                        <p className="text-gray-600 line-clamp-2">{featuredBlog.title} - Read full details regarding eligibility, application process, and official deadlines for this government notification.</p>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* Recent News Grid */}
                        <div className="flex items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">Latest Notifications</h2>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                                {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {recentBlogs.map((blog, index) => {
                                    const images = extractImageUrlsFromMarkdown(blog.content);
                                    const displayImage = images.length > 0 ? images[0] : placeholderImages[(index + 1) % placeholderImages.length];

                                    return (
                                        <Link key={blog.slug || index} href={`/blog/${blog.slug}`} className="group h-full">
                                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                                                <div className="relative h-48 w-full overflow-hidden">
                                                    <Image
                                                        src={displayImage}
                                                        alt={blog.title ? String(blog.title) : "Blog post image"}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                </div>
                                                <div className="p-4 flex flex-col flex-grow">
                                                    <div className="text-xs text-blue-600 font-semibold mb-2 uppercase tracking-wide">
                                                        News Update
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-700">
                                                        {blog.title}
                                                    </h3>
                                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                                                        <span className="text-xs text-gray-500 flex items-center">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            {new Date(blog.created_at).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-xs font-medium text-orange-600 flex items-center group-hover:translate-x-1 transition-transform">
                                                            Read More <ChevronRight className="w-3 h-3 ml-1" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN (Sidebar) - Spans 4 cols */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Quick Links / Important Links - The heart of a Sarkari site */}
                        <div className="sticky top-4">
                            <SidebarWidget 
                                title="Important Links" 
                                icon={FileText}
                                items={["SSC CGL 2024 Notification", "UPSC Prelims Result Declared", "Railway Group D Admit Card", "PM Awas Yojana List 2024"]} 
                            />
                            
                            <SidebarWidget 
                                title="Admit Cards" 
                                icon={Bell}
                                items={["IBPS PO Mains Call Letter", "CTET July 2024 Admit Card", "Bihar Police Constable Hall Ticket"]} 
                            />

                            {/* Simple Ad or Highlight placeholder */}
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 text-center">
                                <h4 className="font-bold text-orange-800 mb-2">Join Telegram Channel</h4>
                                <p className="text-sm text-orange-700 mb-4">Get instant updates on your phone.</p>
                                <button className="bg-blue-500 text-white text-sm font-bold py-2 px-4 rounded-full w-full hover:bg-blue-600 transition-colors">
                                    Join Now
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Newsletter Section */}
                <Newsletter />
                
            </div>
        </div>
    );
}