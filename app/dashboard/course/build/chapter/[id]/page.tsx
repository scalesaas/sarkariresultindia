import React from "react";
import { SITE_URL } from "@/app/config"
import supabase from "@/utils/supabase/supabase";
import "react-quill/dist/quill.snow.css";
import ChapterTable from "../../../compoennts/ChaptersTable";
import ALLchapters from "../../../compoennts/allchapters";

export default async function Page({ params }: { params: { id: string } }) {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Chapter Management</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">{params.id}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Managing Chapters for "{params.id}"
            </h1>
            <p className="text-gray-600">
              Add, edit, and organize chapters for this content section
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Primary Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Chapter Management
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Create and manage chapters for this section
                </p>
              </div>
              <div className="p-6">
                <ChapterTable id={params.id} />
              </div>
            </div>

            {/* Uncomment when ready to use */}
            {/* 
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Chapters
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  View all chapters in this section
                </p>
              </div>
              <div className="p-6">
                <ALLchapters id={params.id} />
              </div>
            </div>
            */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium">
                  Add New Chapter
                </button>
                <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200 font-medium">
                  Import Chapters
                </button>
                <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200 font-medium">
                  Export All
                </button>
              </div>
            </div>

            {/* Chapter Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Statistics
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Chapters</span>
                    <span className="text-sm font-semibold text-gray-900">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Published</span>
                    <span className="text-sm font-semibold text-green-600">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Draft</span>
                    <span className="text-sm font-semibold text-yellow-600">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending Review</span>
                    <span className="text-sm font-semibold text-orange-600">1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-gray-900 font-medium">Chapter 5</span>
                    <span className="text-gray-600"> was updated</span>
                    <div className="text-gray-500 text-xs mt-1">2 hours ago</div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-900 font-medium">Chapter 3</span>
                    <span className="text-gray-600"> was published</span>
                    <div className="text-gray-500 text-xs mt-1">1 day ago</div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-900 font-medium">Chapter 7</span>
                    <span className="text-gray-600"> was created</span>
                    <div className="text-gray-500 text-xs mt-1">2 days ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}