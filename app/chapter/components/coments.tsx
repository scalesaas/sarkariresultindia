"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useUser } from "@/lib/store/user";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cross1Icon, ChatBubbleIcon, PersonIcon } from "@radix-ui/react-icons";
interface CommentData {
  coment: string;
  coment_id: string;
  created_at: string;
  slug_id: string;
  user_id: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
    email?: string;
  } | null;
}

interface PostCommentData {
  coment: string;
  created_at: string;
  slug_id: string;
  user_id: string;
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Comments = ({ id, toggleCommentSection }: { id: string; toggleCommentSection: () => void }) => {
  const [comments, setComments] = useState<CommentData[] | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [refresh, setRefresh] = useState(false);
  const user = useUser((state) => state.user);
  const picture = user?.user_metadata?.picture;

  const form = useForm<PostCommentData>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
  };

  const handleSubmit = async () => {
    if (!newComment || !user?.id) return;

    const newCommentData: PostCommentData = {
      coment: newComment,
      created_at: new Date().toISOString(),
      slug_id: id,
      user_id: user.id,
    };
    console.log("Submitting comment:", newCommentData);
    const { error } = await supabase.from("blog_coments").insert([newCommentData]);

    if (error) {
      console.error("Insert failed:", error);
    } else {
      setNewComment("");
      setRefresh((prev) => !prev); // trigger refresh
    }
  };

  const readComments = async () => {
    setLoading(true);
    try {
      // First try with profiles join
      const { data, error } = await supabase
        .from("blog_coments")
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            email
          )
        `)
        .eq("slug_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Failed to fetch with profiles, trying basic query:", error);
        // Fallback to basic query if profiles join fails
        const { data: basicData, error: basicError } = await supabase
          .from("blog_coments")
          .select("*")
          .eq("slug_id", id)
          .order("created_at", { ascending: false });
        
        if (basicError) throw new Error(basicError.message);
        setComments(basicData);
      } else {
        setComments(data);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    readComments();
  }, [id, refresh]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 rounded-full">
            <ChatBubbleIcon className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Responses</h1>
            <p className="text-sm text-gray-500">
              {comments?.length || 0} {comments?.length === 1 ? 'comment' : 'comments'}
            </p>
          </div>
        </div>
        <button 
          onClick={toggleCommentSection} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <Cross1Icon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Comment Form */}
      <div className="px-6 py-4 border-b border-gray-50">
        {user?.id ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={picture}
                  alt="user"
                  width={36}
                  height={36}
                  className="rounded-full border-2 border-gray-200"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <span className="font-medium text-gray-700">Share your thoughts</span>
            </div>
            
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="What do you think about this?"
                value={newComment}
                onChange={handleInputChange}
                className="border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-lg px-4 py-3 text-sm"
              />
              <Button 
                onClick={handleSubmit} 
                disabled={!newComment.trim()}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Post Comment
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4">
              <PersonIcon className="w-12 h-12 text-gray-300 mx-auto" />
            </div>
            <p className="text-gray-600 mb-4">Join the conversation</p>
            <Link 
              href="/login" 
              className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
            >
              Sign in to comment
            </Link>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="space-y-3 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
              <p className="text-gray-500 text-sm">Loading comments...</p>
            </div>
          </div>
        ) : comments?.length ? (
          <div className="space-y-1">
            {comments.map((item, index) => (
              <div key={item.coment_id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {item.profiles?.avatar_url ? (
                      <Image
                        src={item.profiles.avatar_url}
                        alt="user"
                        width={32}
                        height={32}
                        className="rounded-full border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {item.profiles?.full_name 
                            ? item.profiles.full_name.charAt(0).toUpperCase()
                            : item.profiles?.email 
                            ? item.profiles.email.charAt(0).toUpperCase()
                            : user?.id === item.user_id && user?.user_metadata?.name
                            ? user.user_metadata.name.charAt(0).toUpperCase()
                            : user?.id === item.user_id && user?.email
                            ? user.email.charAt(0).toUpperCase()
                            : 'A'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {item.profiles?.full_name 
                          || item.profiles?.email?.split('@')[0] 
                          || (user?.id === item.user_id && user?.user_metadata?.name)
                          || (user?.id === item.user_id && user?.user_metadata?.full_name)
                          || (user?.id === item.user_id && user?.email?.split('@')[0])
                          || 'Anonymous User'}
                      </p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(item.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="ml-11">
                    <p className="text-gray-800 text-sm leading-relaxed">{item.coment}</p>
                  </div>
                </div>
                
                {index < comments.length - 1 && (
                  <div className="mt-4 ml-11 border-b border-gray-100"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ChatBubbleIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No comments yet</h3>
            <p className="text-gray-500 text-sm text-center">Be the first to share your thoughts on this post!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;