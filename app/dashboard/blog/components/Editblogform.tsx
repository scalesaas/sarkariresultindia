"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState, useCallback, useTransition, useMemo } from "react";
import { useUser } from "@/lib/store/user";
import { Button } from "@/components/ui/button";
import slugify from "slugify";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { IBlogDetial } from "@/lib/types";
import { BlogFormSchemaType } from "../schema";
import { Switch } from "@/components/ui/switch";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import Footer from "@/components/Footer";
import remarkGfm from "remark-gfm";
import ImageGallery from "./ImageGallery";
import { Copy, Check, Upload, X, Plus } from 'lucide-react';
import { onUploadImageAction } from "./feats/file/actions/image-upload.action";



const MdxEditor = dynamic(() => import("@/components/editor/mdx-editor"), { ssr: false });

// Add loading component for BlogBody
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

import Image from "next/image";
import Link from "next/link";
import logo from "../../../image.png";
import { 
  Edit3, 
  Eye, 
  Save, 
  FileText, 
  User, 
  Calendar,
  Hash,
  MessageCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Github,
  Instagram,
  Twitter,
  Linkedin,
  Image as ImageIcon,
  Share2,
  MoreVertical,
  Clock,
  BookOpen
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BlogFormProps {
  defaultBlog: IBlogDetial;
  onblogsubmit: (data: BlogFormSchemaType) => void;
}

export default function BlogForm({ onblogsubmit, defaultBlog }: BlogFormProps) {
  const [isPreview, setPreview] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
      const [showImageGallery, setShowImageGallery] = useState(false);
  const user = useUser((state) => state.user);

  const form = useForm<BlogFormSchemaType>({
    mode: "all",
    defaultValues: {
      title: defaultBlog?.title || "",
      image: defaultBlog?.image || "",
      status: defaultBlog?.status || true,
      author: defaultBlog?.author || "",
      content: defaultBlog?.content || "",
      meta_title: defaultBlog?.meta_tiltle || "",
      meta_description: defaultBlog?.meta_description || "",
      created_at: defaultBlog?.created_at || "",
      slug: defaultBlog?.slug || "",
      coments_enabled: defaultBlog?.coments_enabled || false,
    },
  });

  // Ensure component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const onSubmit = (data: BlogFormSchemaType) => {
    startTransition(() => {
      onblogsubmit(data);
    });
  };

  const onChangeValue = useCallback((markdown: string) => {
    form.setValue("content", markdown);
    form.setValue("meta_description", markdown.slice(0, 160));
  }, [form]);

  useEffect(() => {
    if (form.getValues().title && user?.id) {
      const slug = slugify(form.getValues().title, { lower: true }) + user?.id;
      form.setValue("slug", slug);
      form.setValue("meta_title", form.getValues().title);
      form.setValue("author", user?.id);
      form.setValue("created_at", new Date().toISOString().slice(0, 16));
    }
  }, [form.getValues().title, user?.id, form]);

  const formStatus = form.formState.isValid ? "Ready" : "Invalid";
  const wordCount = form.getValues().content?.length || 0;

  // Memoize the BlogBody component to prevent unnecessary re-renders
  const memoizedBlogBody = useMemo(() => {
    const content = form.getValues().content || '';
    return <BlogBody source={content} />;
  }, [form.watch("content")]);

  // Memoize the ReactMarkdown component for fallback
  const memoizedMarkdown = useMemo(() => {
    const content = form.getValues().content || '';
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    );
  }, [form.watch("content")]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Blog Editor</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                formStatus === "Ready" ? "bg-green-500" : "bg-red-500"
              }`}></div>
              <span className="text-sm text-gray-600">{formStatus}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{user?.email || "Guest"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              onClick={() => setPreview(!isPreview && !form.getFieldState("image").invalid)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              {isPreview ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </>
              )}
            </Button>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={form.getValues().status}
                  onCheckedChange={(checked) => form.setValue("status", checked)}
                />
                <span className="text-sm text-gray-700">Published</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={form.getValues().coments_enabled}
                  onCheckedChange={(checked) => form.setValue("coments_enabled", checked)}
                />
                <span className="text-sm text-gray-700">Comments</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <BookOpen className="w-4 h-4" />
              <span>{wordCount} characters</span>
            </div>
              <Button
              type="button"
              onClick={() => setShowImageGallery(!showImageGallery)}
              variant="outline"
              className="text-gray-700 flex float-right border-gray-300 hover:bg-gray-50"
            >
              <ImageIcon className="w-4 h-4 float-right" />
              {showImageGallery ? 'Hide Gallery' : 'Show Gallery'}
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={!form.formState.isValid || isPending}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Form {...form}>
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {!isPreview ? (
            <div className="space-y-6">
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
              {/* Title Input */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-medium text-gray-900">Blog Title</h2>
                </div>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Enter your blog title..."
                          {...field}
                          autoFocus
                          className="text-2xl font-bold border-0 px-0 py-3 focus:ring-0 placeholder-gray-400"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Slug</span>
                  </div>
                  <p className="text-sm text-gray-500 font-mono break-all">
                    {form.getValues().slug || "Auto-generated"}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Author</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {user?.email || "Unknown"}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Created</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {form.getValues().created_at ? 
                      new Date(form.getValues().created_at).toLocaleDateString() : 
                      "Now"
                    }
                  </p>
                </div>
              </div>

              {/* Editor */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Content Editor</h3>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        wordCount > 0 ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="text-sm text-gray-600">
                        {wordCount > 0 ? 'Content available' : 'No content'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="min-h-[500px]">
                    <MdxEditor
                      key="editor"
                      defaultValue={form.getValues().content || ""}
                      onChange={onChangeValue}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Preview Mode */
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">Live Preview</h3>
                </div>
              </div>

              <div className="p-8">
                <div className="max-w-4xl mx-auto">
                  {/* Blog Header */}
                  <div className="space-y-6 mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                      {form.getValues().title || "Untitled Blog"}
                    </h1>
                    
                    {/* Author Info */}
                    <div className="flex items-center justify-between py-6 border-b border-gray-200">
                      <div className="flex items-center space-x-4">
                        <Image
                          className="rounded-full border-2 border-gray-200"
                          width={50}
                          height={50}
                          alt="profile"
                          src={logo}
                        />
                        <div>
                          <p className="font-medium text-gray-900">Author</p>
                          <p className="text-sm text-gray-500">
                            {form.getValues().created_at ? 
                              new Date(form.getValues().created_at).toLocaleDateString() : 
                              "Today"
                            }
                          </p>
                        </div>
                      </div>
                      
                      {/* Social Links */}
                      <div className="flex items-center space-x-4">
                        <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                          <Github className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                          <Instagram className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                          <Twitter className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                          <Linkedin className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">Comments</span>
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="text-gray-600 hover:text-gray-900 transition-colors">
                            <Share2 className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white border-gray-200">
                            <DropdownMenuLabel className="text-gray-700">Share Article</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-200" />
                            <DropdownMenuItem className="text-gray-600 hover:bg-gray-50">
                              <Share2 className="w-4 h-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-600 hover:bg-gray-50">
                              <Twitter className="w-4 h-4 mr-2" />
                              Share on Twitter
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-600 hover:bg-gray-50">
                              <Linkedin className="w-4 h-4 mr-2" />
                              Share on LinkedIn
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger className="text-gray-600 hover:text-gray-900 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white border-gray-200">
                            <DropdownMenuLabel className="text-gray-700">Options</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-200" />
                            <DropdownMenuItem className="text-gray-600 hover:bg-gray-50">
                              Follow Author
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 hover:bg-gray-50">
                              Report Article
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="prose prose-gray max-w-none
                    prose-headings:text-gray-900
                    prose-p:text-gray-700 prose-p:leading-relaxed
                    prose-code:bg-gray-100 prose-code:text-gray-800
                    prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-200
                    prose-blockquote:border-l-gray-300 prose-blockquote:bg-gray-50
                    prose-a:text-gray-900 prose-a:underline hover:prose-a:no-underline
                    prose-strong:text-gray-900 prose-em:text-gray-700
                    prose-li:text-gray-700
                  ">
                    {form.getValues().content ? (
                      isClient ? (
                        memoizedBlogBody
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded p-4 flex items-center justify-center">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Loading preview...</span>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="text-gray-400 text-center py-8">
                        No content available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Form>
      {/* Footer */}
      <Footer/>
    </div>
  );
}