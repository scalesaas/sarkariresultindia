import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getexams } from "@/lib/actions/blog"; // Ensure this path matches your file structure
import { 
  Calendar, 
  ExternalLink, 
  Youtube, 
  BookOpen, 
  Video, 
  Download, 
  Clock, 
  Globe 
} from "lucide-react";

// --- Types based on your SQL JSONB structures ---
interface YoutubeChannel {
  name: string;
  url: string;
  recommended_for?: string; 
  subscribers?: string;
}

interface Course {
  platform: string;
  title: string;
  url: string;
  is_paid: boolean;
  price?: string;
}

interface StudyMaterial {
  title: string;
  type: "PDF" | "Link";
  url: string;
}

// --- Helper: Date Formatter ---
const formatDate = (dateString: string | null) => {
  if (!dateString) return "TBD";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// --- Helper: Countdown Logic ---
const getDaysLeft = (dateString: string | null) => {
  if (!dateString) return null;
  const examDate = new Date(dateString);
  const today = new Date();
  const diffTime = examDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export default async function ExamPage({ params }: { params: { slug: string } }) {
  // 1. Fetch Data
  const exam = await getexams(params.slug);

  // 2. Handle 404
  if (!exam) {
    notFound();
  }

  // 3. Process Data
  const daysLeft = getDaysLeft(exam.exam_date);
  
  // Safe Type Casting for JSONB fields
  const youtubeChannels = (exam.youtube_channels || []) as YoutubeChannel[];
  const premiumCourses = (exam.premium_courses || []) as Course[];
  const studyMaterials = (exam.study_materials || []) as StudyMaterial[];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* --- HERO SECTION --- */}
        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-start gap-4">
              {/* Exam Icon */}
              {exam.icon_url ? (
                <img 
                  src={exam.icon_url} 
                  alt={exam.title} 
                  className="w-20 h-20 rounded-xl object-contain bg-gray-50 p-2 border" 
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl border border-blue-200">
                  {exam.title.charAt(0)}
                </div>
              )}
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                    {exam.category || "General"}
                  </Badge>
                  {daysLeft !== null && daysLeft < 30 && (
                    <Badge variant="destructive" className="animate-pulse">
                      Closing Soon
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{exam.title}</h1>
                <p className="text-gray-500 max-w-2xl">{exam.short_description}</p>
              </div>
            </div>

            {/* Countdown Card */}
            {daysLeft !== null && (
              <div className="bg-gray-900 text-white p-4 rounded-xl text-center min-w-[140px]">
                <div className="text-3xl font-bold mb-1">{daysLeft}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Days Left</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Exam Date</p>
                <p className="font-medium">{formatDate(exam.exam_date)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">App Deadline</p>
                <p className="font-medium">{formatDate(exam.application_end_date)}</p>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3">
              {exam.syllabus_pdf_url && (
                <Link href={exam.syllabus_pdf_url} target="_blank">
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" /> Download Syllabus
                  </Button>
                </Link>
              )}
              {exam.official_website_url && (
                <Link href={exam.official_website_url} target="_blank">
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                    Official Website <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* --- MAIN GRID CONTENT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN (Resources) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. YOUTUBE CHANNELS */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Youtube className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-bold text-gray-900">Best YouTube Channels</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {youtubeChannels.length > 0 ? (
                  youtubeChannels.map((channel, idx) => (
                    <Link href={channel.url} key={idx} target="_blank" className="group">
                      <Card className="hover:shadow-md transition-all duration-200 border-gray-200 hover:border-red-200 h-full">
                        <CardContent className="p-4 flex items-center justify-between h-full">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold shrink-0">
                              {channel.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1">
                                {channel.name}
                              </h3>
                              {channel.recommended_for && (
                                <p className="text-xs text-gray-500">Best for: {channel.recommended_for}</p>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-red-600 shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
                    No channels added yet.
                  </div>
                )}
              </div>
            </section>

            {/* 2. COURSES */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Video className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Recommended Courses</h2>
              </div>
              <div className="space-y-3">
                {premiumCourses.length > 0 ? (
                  premiumCourses.map((course, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-purple-200 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                            {course.platform}
                          </span>
                          {course.is_paid ? (
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">Paid</span>
                          ) : (
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-100 text-green-700">Free</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mt-1">{course.title}</h3>
                      </div>
                      <Link href={course.url} target="_blank" className="w-full sm:w-auto">
                        <Button variant="secondary" size="sm" className="w-full">
                          View Course
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                   <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
                    No courses listed yet.
                  </div>
                )}
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN (Materials & Strategy) */}
          <div className="space-y-8">
            
            {/* STRATEGY VIDEO */}
            {exam.roadmap_video_url && (
              <Card className="overflow-hidden border-none shadow-lg bg-gray-900 text-white">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="w-5 h-5" /> Winning Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-video w-full bg-black relative flex items-center justify-center group cursor-pointer">
                    <Link href={exam.roadmap_video_url} target="_blank" className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity w-full h-full justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30 group-hover:scale-110 transition-transform">
                        <Video className="w-6 h-6 text-white fill-current" />
                      </div>
                      <span className="text-sm font-medium">Watch Roadmap</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* STUDY MATERIALS */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Study Materials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {studyMaterials.length > 0 ? (
                  studyMaterials.map((item, idx) => (
                    <Link href={item.url} key={idx} target="_blank" className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-md shrink-0">
                          {item.type === 'PDF' ? <Download className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 truncate">
                          {item.title}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No materials uploaded yet.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* QUICK DATES SUMMARY */}
            <Card className="bg-blue-50 border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-900 text-base">Important Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700/70">Application Start</span>
                  <span className="font-medium text-blue-900">{formatDate(exam.application_start_date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700/70">Application End</span>
                  <span className="font-medium text-blue-900">{formatDate(exam.application_end_date)}</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}