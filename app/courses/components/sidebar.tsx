"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { IModules, IchapterModules } from '@/lib/types';
import { readchaptersbymodules } from '@/lib/actions/blog';
import Link from 'next/link';
import Loading from './loader';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SidebarProps {
  modules: IModules;
  courseId: string;
}

function Sidebar({ modules, courseId }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [chapterData, setChapterData] = useState<{ [moduleId: string]: IchapterModules[] }>({});
  const [loader, setLoading] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true);
        const moduleIds = modules.map((module) => module.slug);
        const response = await readchaptersbymodules(moduleIds);

        if (response && Array.isArray(response.data)) {
          const groupedChapters: { [key: string]: IchapterModules[] } = {};
          response.data.forEach((chapter: IchapterModules) => {
            const moduleId = chapter?.module_id;
            if (moduleId !== undefined && moduleId !== null) {
              if (!groupedChapters[moduleId]) {
                groupedChapters[moduleId] = [];
              }
              // Fix: Use non-null assertion since we just checked above
              groupedChapters[moduleId]!.push(chapter);
            }
          });

          setChapterData(groupedChapters);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chapters:", error);
        setLoading(false);
      }
    };

    if (modules.length > 0) {
      fetchChapters();
    }
  }, [modules]);

  // Close mobile menu when clicking on a chapter link
  const handleChapterClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Check if current chapter is active
  const isChapterActive = (chapterSlug: string) => {
    return pathname === `/courses/${courseId}/${chapterSlug}`;
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border rounded-md shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative
          top-0 left-0
          h-full md:h-auto
          w-[350px] md:w-[300px]
          bg-white md:bg-transparent
          border-r md:border-r-0
          shadow-lg md:shadow-none
          transform transition-transform duration-300 ease-in-out
          z-40 md:z-auto
          mx-0 md:mx-4
          overflow-y-auto
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile header with close button */}
        <div className="md:hidden flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Course Content</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="p-4 md:p-0">
          {loader ? (
            <Loading />
          ) : (
            <div>
              {modules.map((module, index) => (
                <Accordion type="single" collapsible key={module.slug}>
                  <AccordionItem value={`item-${index}`}>
                    <AccordionTrigger className="w-full max-w-[250px] md:max-w-[400px]">
                      {module.module_name}
                    </AccordionTrigger>
                    {chapterData[module.slug]?.map((chapter) => (
                      <AccordionContent key={chapter.slug}>
                        <Link href={`/courses/${courseId}/${chapter.slug}`}>
                          <button
                            onClick={handleChapterClick}
                            className={`text-left w-full py-2 px-3 rounded-md transition-colors duration-200 ${
                              isChapterActive(chapter.slug)
                                ? 'bg-blue-100 text-blue-700 font-semibold border-l-4 border-blue-500'
                                : 'hover:bg-gray-100 hover:text-blue-600 text-gray-700'
                            }`}
                          >
                            {chapter.chapter_name}
                          </button>
                        </Link>
                      </AccordionContent>
                    ))}
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;