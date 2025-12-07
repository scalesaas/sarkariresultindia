import React from "react";
import Content from "../components/Content";
import { SITE_URL } from "@/app/config";
import supabase from "@/utils/supabase/supabase";
import Navbar from "@/app/navbar/navbar";
import BlogBody from "@/components/editor/BlogBody";
import Footer from "@/components/Footer";

export async function generateStaticParams() {
  const { data: chapters, error } = await supabase
    .from("chapters")
    .select("slug");
  if (error) {
    throw error;
  }

  return chapters?.map((chapter) => ({ id: chapter.slug }));
}


function extractImageUrlsFromMarkdown(markdown: string): string[] {
	const imageUrls: string[] = [];
	
	// Regex for markdown images: ![alt text](image-url)
	const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
	// Regex for HTML images in markdown: <img src="..." />
	const htmlImageRegex = /<img[^>]+src="([^">]+)"/g;
	
	let match: RegExpExecArray | null;
	
	// Extract markdown format images
	while ((match = markdownImageRegex.exec(markdown))) {
		const src = match[2];
		if (src) {
			imageUrls.push(src);
		}
	}
	
	// Extract HTML format images (in case markdown contains HTML)
	while ((match = htmlImageRegex.exec(markdown))) {
		const src = match[1];
		if (src) {
			imageUrls.push(src);
		}
	}
	
	return imageUrls;
}

// Random placeholder images for fallback
const placeholderImages = [
	"https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=300&fit=crop",
	"https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=300&fit=crop",
	"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=300&fit=crop",
	"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=300&fit=crop",
	"https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&h=300&fit=crop"
];





export async function generateMetadata({ params }: { params: { id: string } }) {
    const { data, error } = await supabase
                .from("chapters")
                .select("*")
                .eq("slug", params.id)
                .single();
      const chapter = await data
        const images = extractImageUrlsFromMarkdown(chapter.content);
        const displayImage = images.length > 0 ? images[0] : placeholderImages[ 0 % placeholderImages.length];


      return {
        title: chapter?.Name,
        openGraph: {
          title: chapter?.title,
          url: `${SITE_URL}blog/${params.id}`,
          siteName: "Hardware Garage",
          images: displayImage,
          type: "website",
        },
        keywords: ["mechatronics", "arduino", "Raspberry pi"],
      };
    }

    export default async function Page({ params }: { params: { id: string } }) {
    
      const { data: chapter, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("slug", params.id)
        .single();

  
    const { data: authorData, error: authorError } = await supabase
      .from("instructor")
      .select("*")
      .eq("id", chapter.instructor)
      .single();

      return (
        <div>
                <Navbar/>
               <article className="pt-8">
              <div className="max-w-[1100px] md:pt-[80px] pt-[30px] mx-auto  ">
                <Content  chapter={chapter} author={authorData} />
              </div>
              <div className="max-w-[900px] mx-auto">
                <BlogBody source={chapter?.content || ""} />
              </div>
               </article>
               <Footer />
            </div>
      );
    }