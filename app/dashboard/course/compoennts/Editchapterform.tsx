"use client";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useState, useCallback, useTransition } from "react";
import { useUser } from "@/lib/store/user";
import { Button } from "@/components/ui/button";
import slugify from "slugify";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { IchapterDetails, Catagories, IModule } from "@/lib/types";
import { Chapterformschematype } from "../../blog/schema";
import { readCatogries } from "@/lib/actions/blog";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
import ImageGallery from "../../blog/components/ImageGallery";
import { Copy, Check, Upload, X, Plus } from 'lucide-react';
import { onUploadImageAction } from "../../blog/components/feats/file/actions/image-upload.action";

import { 
  Terminal, 
  Code, 
  Eye, 
  Edit3, 
  Save, 
  FileText, 
  User, 
  Calendar,
  Hash,
  Image as ImageIcon,
  Loader2,
  BookOpen,
  Layers,
  Tag,
  Link2
} from "lucide-react";

const MdxEditor = dynamic(() => import("@/components/editor/mdx-editor"), { ssr: false });
const BlogBody = dynamic(() => import("@/components/editor/BlogBody"), { 
  ssr: false,
  loading: () => (
    <div className="min-h-[500px] bg-gray-50 border border-gray-200 rounded p-4 flex items-center justify-center">
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading preview...</span>
      </div>
    </div>
  )
});

export default function Editchapterform({
  onchaptersubmit,
  defaultlesson,
}: {
  defaultlesson: IchapterDetails;
  onchaptersubmit: (data: Chapterformschematype) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isPreview, setPreview] = useState(false);
  const [categories, setCategories] = useState<Catagories[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
      const [showImageGallery, setShowImageGallery] = useState(false);

  const user = useUser((state) => state.user);

  const form = useForm<Chapterformschematype>({
    mode: "all",
    defaultValues: {
      catagory_id: defaultlesson?.catagory_id || 0,
      chapter_name: defaultlesson?.chapter_name || "",
      content: defaultlesson?.content || "",
      course_id: defaultlesson?.course_id || "",
      created_at: defaultlesson?.created_at || "",
      description: defaultlesson?.description || "",
      instructor: defaultlesson?.instructor || "",
      module_id: defaultlesson?.module_id || "",
      chapterno: defaultlesson?.chapterno || "",
      slug: defaultlesson?.slug || "",
      image: defaultlesson?.image || "",
    },
  });

  // Watch form values for reactivity
  const watchedContent = form.watch("content");
  const watchedChapterName = form.watch("chapter_name");

  // Ensure component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const onSubmit = (data: Chapterformschematype) => {
    startTransition(() => {
      onchaptersubmit(data);
    });
  };

  const onChangeValue = useCallback((markdown: string) => {
    form.setValue("content", markdown, { shouldValidate: true });
    form.setValue("description", markdown.slice(0, 160));
  }, [form]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: Catagories } = await readCatogries();
        if (Catagories) {
          setCategories(Catagories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    
    fetchCategories();
  }, []);

  // Update slug and metadata when chapter name or user changes
  useEffect(() => {
    if (watchedChapterName && user?.id) {
      const slug = slugify(watchedChapterName, { lower: true }) + "-" + user.id;
      form.setValue("slug", slug);
      form.setValue("instructor", user.id);
      
      // Only set created_at if it's not already set (for new chapters)
      if (!form.getValues().created_at) {
        form.setValue("created_at", new Date().toISOString().slice(0, 16));
      }
    }
  }, [watchedChapterName, user?.id, form]);

  const formStatus = form.formState.isValid ? "Ready" : "Invalid";
  const wordCount = watchedContent?.length || 0;

  // Memoized blog body to prevent unnecessary re-renders
  const memoizedBlogBody = useMemo(() => {
    const content = watchedContent || '';
    if (!content.trim()) {
      return <div className="text-gray-500 italic">No content to preview</div>;
    }
    return <BlogBody source={content} />;
  }, [watchedContent]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-700">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-gray-500" />
            <span className="text-gray-800 font-medium">Chapter Editor</span>
          </div>
          <div className="text-sm text-gray-500">
            {currentTime.toLocaleTimeString()} | {user?.email || "Guest"}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-100 border-b border-gray-200 p-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Status:</span>
              <span className={`${formStatus === "Ready" ? "text-green-600" : "text-orange-600"}`}>
                {formStatus}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Mode:</span>
              <span className="text-blue-600">
                {isPreview ? "Preview" : "Edit"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Words:</span>
              <span className="text-gray-700">{wordCount}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button
              type="button"
              onClick={() => setShowImageGallery(!showImageGallery)}
              variant="outline"
              className="text-gray-700 flex float-right border-gray-300 hover:bg-gray-50"
            >
              <ImageIcon className="w-4 h-4 float-right" />
              {showImageGallery ? 'Hide Gallery' : 'Show Gallery'}
            </Button>
            {isPending && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
            <span className="text-gray-600">
              {isPending ? "Saving..." : "Ready"}
            </span>
          </div>
        </div>
      </div>

      <Form {...form}>
        {/* Control Panel */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                onClick={() => setPreview(!isPreview)}
                variant="outline"
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                {isPreview ? (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </>
                )}
              </Button>
            </div>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={!form.formState.isValid || isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Chapter
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Chapter Title Input */}
                 {showImageGallery && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg max-w-5xl max-h-[90vh] w-full overflow-hidden shadow-2xl">
                              {/* Modal Header */}
                              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <ImageIcon className="w-5 h-5 text-gray-600" />
                                  <h2 className="text-lg font-semibold text-gray-800">Image Gallery</h2>
                                  <span className="text-sm text-gray-500">
                                    Manage your images for MDX editor
                                  </span>
                                </div>
                                <button
                                  onClick={() => setShowImageGallery(false)}
                                  className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-200 rounded-full"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                              
                              {/* Modal Content */}
                              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                                <ImageGallery 
                                  onUploadImageAction={onUploadImageAction}
                                  className="border-0 shadow-none rounded-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 font-medium">Chapter Title</span>
              </div>
              <FormField
                control={form.control}
                name="chapter_name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Enter chapter title..."
                        {...field}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            {/* Chapter Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Chapter Number */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 font-medium">Chapter Number</span>
                </div>
                <FormField
                  control={form.control}
                  name="chapterno"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter chapter number..."
                          {...field}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Category Selection */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 font-medium">Category</span>
                </div>
                <FormField
                  control={form.control}
                  name="catagory_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="">Select a category...</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   
            </div>

            {/* Metadata Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 text-sm">Slug</span>
                </div>
                <div className="text-gray-700 text-sm break-all">
                  {form.getValues().slug || "auto-generated"}
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 text-sm">Instructor</span>
                </div>
                <div className="text-gray-700 text-sm">
                  {user?.email || "Unknown"}
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 text-sm">Created</span>
                </div>
                <div className="text-gray-700 text-sm">
                  {form.getValues().created_at ? 
                    new Date(form.getValues().created_at).toLocaleDateString() : 
                    "Now"
                  }
                </div>
              </div>
            </div>

            {/* Editor/Preview Panel */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Code className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 font-medium">
                    {isPreview ? "Preview" : "Content Editor"}
                  </span>
                  <div className="flex items-center gap-2 ml-auto">
                    <div className={`w-2 h-2 rounded-full ${
                      wordCount > 0 ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-xs text-gray-500">
                      {wordCount > 0 ? 'Active' : 'Empty'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative">
                {/* Editor */}
                {!isPreview && (
                  <div className="p-4 min-h-[500px]">
                    <MdxEditor
                      key="editor"
                      defaultValue={form.getValues().content || ""}
                      onChange={onChangeValue}
                    />
                  </div>
                )}

                {/* Preview */}
                {isPreview && (
                  <div className="p-4 min-h-[500px]">
                    {isClient ? (
                      <div className="bg-gray-50 border border-gray-200 rounded p-4">
                        <div className="prose prose-gray max-w-none
                          prose-headings:text-gray-800
                          prose-p:text-gray-700 prose-p:leading-relaxed
                          prose-code:bg-gray-100 prose-code:text-gray-800
                          prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-200
                          prose-blockquote:border-l-gray-400 prose-blockquote:bg-gray-50
                          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                          prose-strong:text-gray-800 prose-em:text-gray-600
                          prose-li:text-gray-700
                        ">
                          {memoizedBlogBody}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded p-4 flex items-center justify-center">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Loading preview...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Form>

      {/* Footer */}
      <Footer />
    </div>
  );
}