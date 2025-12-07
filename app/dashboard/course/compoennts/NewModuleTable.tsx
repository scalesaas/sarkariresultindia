import React from "react";
import { EyeOpenIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IBlog } from "@/lib/types";
import SwitchForm from "./SwitchForm";
import DeleteAlert from "./Deletealertmodule";
import { readmodulesbycourseId } from "@/lib/actions/blog";
import { PlusIcon } from "@radix-ui/react-icons";
import ChapterTable from "./ChaptersTable";

interface Props {
  id: string;
}

export default async function ModuleTable({ id }: Props) {
  const { data: modules } = await readmodulesbycourseId(id);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-gray-100">Course Modules</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your course modules and chapters
          </p>
        </div>
        <Link href={`/dashboard/course/build/create/${id}`}>
          <Button className="gap-2" variant="outline">
            <PlusIcon />
            Add Module
          </Button>
        </Link>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        {modules?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No modules found</p>
              <p className="text-sm">Get started by adding your first module</p>
            </div>
          </div>
        ) : (
          modules?.map((module, index) => (
            <ModuleCard key={module.id} module={module} index={index} />
          ))
        )}
      </div>
    </div>
  );
}

const ModuleCard = ({ module, index }: { module: any; index: number }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Module Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium">
                {module.module_number || index + 1}
              </span>
              <h2 className="text-lg font-semibold dark:text-gray-100 truncate">
                {module.module_name}
              </h2>
            </div>
            
            {module.module_description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                {module.module_description}
              </p>
            )}
          </div>
          
          <Actions id={module.id} slug={module.slug} />
        </div>
      </div>

      {/* Chapters Section */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Chapters
          </h3>
        </div>
        <ChapterTable id={module.slug} />
      </div>
    </div>
  );
};

const Actions = ({ id, slug }: { id: number; slug: string }) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link href={`/dashboard/course/build/chapter/${slug}`}>
        <Button size="sm" className="flex gap-2 items-center" variant="default">
          <EyeOpenIcon />
          Build
        </Button>
      </Link>
      
      <Link href={`/dashboard/course/build/edit/${slug}`}>
        <Button size="sm" className="flex gap-2 items-center" variant="outline">
          <Pencil1Icon />
          Edit
        </Button>
      </Link>
      
      <DeleteAlert id={id} />
    </div>
  );
};