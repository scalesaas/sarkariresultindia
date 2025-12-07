"use client"
import React, { useState } from "react";
import Image from "next/image";
import { IAuthor, IchapterDetails } from "@/lib/types";
import Link from "next/link";
import { BsGithub, BsInstagram, BsLinkedin, BsTwitter  } from "react-icons/bs";
import { AiOutlineComment, AiOutlineHeart, AiOutlineEye } from "react-icons/ai";
import { LinkedinIcon, InstagramIcon, TwitterIcon, ShareIcon, ArrowUpRight , CopyIcon, Clock, Calendar } from "lucide-react";
import dynamic from 'next/dynamic';
import Footer from "@/components/Footer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SITE_URL } from "@/app/config";
import { toast } from "@/components/ui/use-toast";

const Comments = dynamic(() => import('./coments'), { ssr: false });

interface Props {
  chapter: IchapterDetails; // Define prop type'
  author: IAuthor;
}

export default function Content({ chapter, author }: Props) {
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  const blogUrl = `https://${SITE_URL}/chapter/${chapter?.slug}`;

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${blogUrl}&text=${encodeURIComponent(chapter?.chapter_name || '')}`, "_blank");
  };
  
  const shareOnThreads = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${blogUrl}`, "_blank");
  };
  
  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/shareArticle?url=${blogUrl}&title=${encodeURIComponent(chapter?.chapter_name || '')}`, "_blank");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(blogUrl);
      toast({ description: "Link copied to clipboard!" });
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const toggleCommentSection = () => {
    setIsCommentSectionOpen(!isCommentSectionOpen);
  };

  const estimatedReadTime = Math.ceil((chapter?.content?.length || 0) / 200); // Rough estimate

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-4xl mx-auto px-6 py-16">
          <div className="text-center space-y-6">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight font-gilroy_bold">
              {chapter?.chapter_name}
            </h1>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(chapter?.created_at!).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{estimatedReadTime} min read</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 mt-8 relative z-10">
        {/* Author Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={author?.linkdin} target="_blank" className="relative group">
                <Image 
                  className="rounded-full border-2 border-white shadow-lg group-hover:shadow-xl transition-shadow duration-300" 
                  width={64} 
                  height={64} 
                  alt="profile" 
                  src={author?.profile} 
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </Link>
              <div>
                <h3 className="font-bold text-lg text-gray-900 font-gilroy_medium">{author?.Name}</h3>
                <p className="text-gray-600 text-sm">Software Engineer & Writer</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link target="_blank" href={author?.github} className="text-gray-600 hover:text-gray-900 transition-colors">
                <BsGithub size={20} />
              </Link>
              <Link target="_blank" href={author?.instagram} className="text-gray-600 hover:text-pink-600 transition-colors">
                <BsInstagram size={20} />
              </Link>
              <Link target="_blank" href={author?.twiter} className="text-gray-600 hover:text-blue-500 transition-colors">
                <BsTwitter size={20} />
              </Link>
              <Link target="_blank" href={author?.linkdin} className="text-gray-600 hover:text-blue-700 transition-colors">
                <BsLinkedin size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
         
              <button
                onClick={toggleCommentSection}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
              >
                <AiOutlineComment />
                <span className="text-sm font-medium">Comments</span>
              </button>
              <div className="flex items-center gap-2 text-gray-500">
                <AiOutlineEye />
                <span className="text-sm">1.2k views</span>
              </div>
            
            </div>
            
            <div className="flex items-center gap-6">
                <Link href={`/courses/${chapter?.course_id}/${chapter?.slug}`} className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200">
                <div className="flex   text-gray-500">
                
                <span className="text-sm text-green-500 ">Full course</span>
                <ArrowUpRight    className="w-4 h-4 text-green-700 pt-1 " /> 
              </div>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200">
                  <ShareIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Share</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem>
                    <button onClick={copyToClipboard} className="flex items-center gap-3 w-full">
                      <CopyIcon className="w-4 h-4" />
                      <span>Copy link</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <button onClick={shareOnTwitter} className="flex items-center gap-3 w-full">
                      <TwitterIcon className="w-4 h-4" />
                      <span>Share on Twitter</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button onClick={shareOnThreads} className="flex items-center gap-3 w-full">
                      <InstagramIcon className="w-4 h-4" />
                      <span>Share on Threads</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button onClick={shareOnLinkedIn} className="flex items-center gap-3 w-full">
                      <LinkedinIcon className="w-4 h-4" />
                      <span>Share on LinkedIn</span>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
          </div>
        </div>

        {/* Blog Content */}
        <div className={`bg-white overflow-hidden transition-all duration-300 ${
          isCommentSectionOpen ? "mr-80" : ""
        }`}>
          <div>
            {/* Medium-style content styling */}
         
          </div>
        </div>
      </div>

      {/* Comments Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-[370px] bg-white shadow-2xl transform transition-transform duration-300 ${
          isCommentSectionOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Comments id={chapter?.slug} toggleCommentSection={toggleCommentSection} />
      </div>

      {/* Overlay */}
      {isCommentSectionOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={toggleCommentSection}
        />
      )}
      {/* Footer */}
    </div>
  );
}
