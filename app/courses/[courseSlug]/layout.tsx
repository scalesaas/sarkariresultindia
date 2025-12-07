'use client';
import React from 'react';
import { readmodulesbycourseId } from '@/lib/actions/blog';
import Sidebar from '@/app/courses/components/sidebar';
import Navbar from '@/app/navbar/navbar';
import PrivateRoute from '@/components/editor/PrivateRoute';
import { IModules } from '@/lib/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseSlug: string };
}) {
  const [modules, setModules] = useState<IModules>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const { data: moduleData } = await readmodulesbycourseId(params.courseSlug);
        setModules(moduleData ?? []);
      } catch (error) {
        console.error('Error fetching modules:', error);
        setModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [params.courseSlug]);

  // Custom fallback for course access
  const courseFallback = (
    <div className="min-h-screen  bg-gray-50/50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Access Required</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access this course content and track your progress.
            </p>
          </div>
          
          <div className="space-y-3">
            <a 
              href="/login" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 inline-block"
            >
              Sign In to Continue
            </a>
            <a 
              href="/courses"
              className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors duration-200 inline-block"
            >
              Browse All Courses
            </a>
            <a 
              href="/"
              className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 px-4 transition-colors duration-200 inline-block"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <PrivateRoute fallback={courseFallback}>
            

      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className=" md:pt-[40px] bg-gray-100 shadow-lg">
          {loading ? (
            <div className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : (
            <Sidebar  courseId={params.courseSlug} modules={modules} />
          )}
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col md:mt-6 overflow-hidden">         
          
          {/* Course content */}
          <main className="flex-1 overflow-y-auto pr-[300px] p-8">
            {children}
          </main>
        </div>

        {/* Floating Coffee Donation Button */}
        <div className="fixed bottom-6 right-6 group z-50">
          <Link
            href="https://www.buymeacoffee.com/ashishrohilla"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-400 hover:bg-yellow-500 text-black p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4v-2z"/>
            </svg>
          </Link>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Buy me a coffee ☕
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
}

// Alternative approach: Server-side version (if you prefer server components)
export async function ServerSideProtectedCourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseSlug: string };
}) {
  // This would require server-side auth check
  // const session = await getServerSession();
  // if (!session) {
  //   redirect('/login');
  // }

  const { data: moduleData } = await readmodulesbycourseId(params.courseSlug);
  const modules: IModules = moduleData ?? [];

  return (
    <div className="flex h-screen bg-gray-100">
        <Navbar />
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <Sidebar  courseId={params.courseSlug} modules={modules} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        
        {/* Course content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Floating Coffee Donation Button */}
      <div className="fixed bottom-6 right-6 group z-50">
        <Link
          href="https://www.buymeacoffee.com/your-username"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-yellow-400 hover:bg-yellow-500 text-black p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
        >
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4v-2z"/>
          </svg>
        </Link>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Buy me a coffee ☕
        </div>
      </div>
    </div>
  );
}