import React from "react";
import { SITE_URL } from "@/app/config";
import supabase from "@/utils/supabase/supabase";
import "react-quill/dist/quill.snow.css";
import ModuleTable from "../../compoennts/NewModuleTable";
import { CalendarIcon, BookmarkIcon } from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";

export default async function Page({ params }: { params: { id: string } }) {
  const { data: course, error } = await supabase
    .from("course")
    .select("*")
    .eq("slug", params.id)
    .single();

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 pt-24 min-h-screen">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Course not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The course you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Course Information */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BookmarkIcon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  Course Builder
                </Badge>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Building: {course.Name}
              </h1>
              
              {course.Description && (
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                  {course.Description}
                </p>
              )}
            </div>

            {/* Course Metadata */}
            <div className="flex-shrink-0">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-w-[200px]">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Created on</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {new Date(course.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Course Progress/Stats (optional) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="h-5 w-5 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">In Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="h-5 w-5 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(course.updated_at || course.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Module Table Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ModuleTable id={course.slug} />
        </div>
      </div>
    </div>
  );
}