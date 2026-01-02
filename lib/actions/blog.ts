"use server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { IBlog, Icourse, IModule } from "@/lib/types";
import { revalidatePath, unstable_noStore } from "next/cache";
const DASHBOARD = "/dashboard/blog";

export async function createBlog(data: {
	content: string;
	title: string;
	image: string;
	author:string;
	meta_title: string;
	meta_description: string;
	slug: string;
	status: boolean;
	created_at: string;
	coments_enabled: boolean;
	
}) {

	const supabase = await createSupabaseServerClient();
	const blogResult = await supabase
		.from("govtblog")
		.insert(data)
		.single();

    return blogResult;
}


export interface Exam {
  id: string;
  title: string;
  slug: string;
  icon_url: string | null;
  short_description: string | null;
  category: string | null; // This fixes the specific error you saw
  exam_date: string | null;
  application_start_date: string | null;
  application_end_date: string | null;
  official_website_url: string | null;
  syllabus_pdf_url: string | null;
  roadmap_video_url: string | null;
  
  // JSON Fields
  youtube_channels: any[] | null;
  premium_courses: any[] | null;
  study_materials: any[] | null;
}

export async function getexams(slug: string): Promise<Exam | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching exam:", error);
    return null;
  }

  // 2. Cast the data to our interface
  return data as Exam;
}


export async function getUserStenoStats() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch attempts with the exercise details
  const { data: attempts, error } = await supabase
    .from("steno_attempts")
    .select(`
      id,
      created_at,
      accuracy_percentage,
      errors_count,
      time_taken_seconds,
      steno_exercises (
        title,
        wpm
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !attempts) return null;

  // Calculate Aggregates
  const totalTests = attempts.length;
  const avgAccuracy = totalTests > 0 
    ? (attempts.reduce((acc, curr) => acc + Number(curr.accuracy_percentage), 0) / totalTests).toFixed(1)
    : 0;

  const bestAccuracy = totalTests > 0 
    ? Math.max(...attempts.map(a => Number(a.accuracy_percentage)))
    : 0;
  
  // --- THE FIX IS HERE ---
  const graphData = attempts.slice(0, 10).reverse().map((a: any) => {
    // Check if steno_exercises is an array or object to satisfy TypeScript
    const exercise = Array.isArray(a.steno_exercises) 
      ? a.steno_exercises[0] 
      : a.steno_exercises;

    return {
      date: new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      accuracy: Number(a.accuracy_percentage),
      wpm: exercise?.wpm || 0 // Now safe to access
    };
  });

  return {
    stats: {
      totalTests,
      avgAccuracy,
      bestAccuracy,
    },
    // Also fix the history mapping if you display titles there
    history: attempts.map((a: any) => {
       const exercise = Array.isArray(a.steno_exercises) 
        ? a.steno_exercises[0] 
        : a.steno_exercises;
       
       return {
         ...a,
         exerciseTitle: exercise?.title || "Unknown",
         exerciseWpm: exercise?.wpm || 0
       }
    }),
    graphData
  };
}


export async function getStenoExercises() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("steno_exercises")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching exercises:", error);
    return [];
  }

  return data;
}


export type SaveProgressData = {
  exercise_id: string;
  accuracy: number;
  errors: number;
  user_transcript: string;
  time_taken_seconds?: number; // Optional: track how long they took
};

export async function saveStenoProgress(data: SaveProgressData) {
  const supabase = await createSupabaseServerClient();
  
  // 1. Get Current User
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "You must be logged in to save progress." };
  }

  // 2. Insert Attempt into Database
  const { error } = await supabase
    .from("steno_attempts")
    .insert({
      user_id: user.id,
      exercise_id: data.exercise_id,
      accuracy_percentage: data.accuracy,
      errors_count: data.errors,
      user_transcript: data.user_transcript,
      time_taken_seconds: data.time_taken_seconds || 0,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error saving steno progress:", error);
    return { error: "Failed to save your progress. Please try again." };
  }

  // 3. Revalidate Paths
  // This ensures that when the user goes back to the dashboard, their new score is visible immediately.
  revalidatePath("/steno/dashboard");
  revalidatePath(`/steno/practice/${data.exercise_id}`);
  
  return { success: true };
}

export async function getProfile(userId: string) {
  const supabase = await createSupabaseServerClient();
  const result = await supabase
    .from("profile")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return result;
}


export async function updateProfile(data: {
  id: string;
  name: string;
  bio?: string | null;
  mobile_no?: string | null;
  weekly_goal_hours?: number | null;
  profile_image?: string | null;
}) {
  const supabase = await createSupabaseServerClient();

  const result = await supabase
    .from("profile")
    .upsert({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (!result.error) {
    // This refreshes the data on the page immediately after saving
    revalidatePath("/profile"); 
  }

  return result;
}

export async function adddidigitalproduct(data: {
	product_title: string,
	product_description: string,
	category: string,
	price: number,
	discount_price: number,
	product_type: string, // digital_download, service, consultation
	delivery_method: string, // instant_download, email, scheduled_call
	tags: string,
	preview_images: string,
	product_files: string, // For downloadable products
	consultation_duration: string, // For consultation services
	available_slots: string, // For services
	skill_level: string, // beginner, intermediate, advanced
	software_requirements: string,
	file_formats: string,
	license_type: string, // personal, commercial, extended
	refund_policy: string, // no_refunds, 7_days, 30_days
	status: string, // draft, active, inactive
	featured: boolean,
	user_id: string, // This would be populated from your auth system
	
}) {

	const supabase = await createSupabaseServerClient();
	const productResult = await supabase
		.from("digital_products")
		.insert(data)
		.single();

    return productResult;
}

export async function createlesson(data: {
	catagory_id: number
	chapter_name: string
	image:string
	content: string 
	course_id: string 
	created_at: string
	description: string 
	instructor: string
	module_id: string 
	chapterno:string 
	slug: string 
	pdffiles:string
}) {

	const supabase = await createSupabaseServerClient();
	const blogResult = await supabase
		.from("chapters")
		.insert(data)
		.single();

    return blogResult;
}

export async function savepdf(pdfFile: File) {
	const supabase = await createSupabaseServerClient();
	const filedata = await supabase.storage
		.from("pdffiles")
		.upload(`pdf/${pdfFile.name}`, pdfFile, {
			cacheControl: '3600',
			upsert: false 
		  
		  });

		  console.log(filedata);

    return filedata;
}


export async function listallimages() {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase.storage
    .from('images')
    .list('uploads', { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } });

  if (error) {
    console.error('Error fetching images:', error);
    return [];
  }

  return data;
}

export async function createModule(data: {
	created_at?: string;
	module_name: string;
	module_description: string;
	module_number: number;
	course_id: string;
	slug: string;
	
}) {

	const supabase = await createSupabaseServerClient();
	const blogResult = await supabase
		.from("modules")
		.insert(data)
		.single();
	revalidatePath("/dashbaord/course/build");	
    return blogResult;
}

export async function createCourse(data: {
	banner_image: string;
	created_at: string;
	Catogory_id: string;
	Description: string;
	instructor: string; 
	Name: string;
	price: string;
	slug: string;
}) {
	const supabase = await createSupabaseServerClient();
	console.log("this is submitable data ", data);
	const CourseResult = await supabase
		.from("course")
		.insert(data)
		.single();
	console.log(CourseResult);	

    return CourseResult;
}


export async function readCatogries() {
	await new Promise((resolve) => setTimeout(resolve, 2000));
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("catagory")
		.select("*")
		.order("created_at", { ascending: true });
}
export async function readmodulescourse(id: string) {
	await new Promise((resolve) => setTimeout(resolve, 2000));
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("modules")
		.select("*")
		.eq("slug", id)
		.single();
}	



export async function readBlog() {
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("govtblog")
		.select("*")
		.eq("status", true)
		.range(0, 7)
		.order("created_at", { ascending: true });
}
export async function readchapter() {
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("chapters")
		.select("*")
		.range(0, 10)
		.order("created_at", { ascending: true });
}



export async function readmoreblog() {
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("govtblog")
		.select("*")
		.eq("status", true)
		.range(0, 35)
		.order("created_at", { ascending: true });
}


export async function readcourse() {
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("course")
		.select("*")
		.order("created_at", { ascending: true });
}

export async function readBlogAdmin() {
	await new Promise((resolve) => setTimeout(resolve, 2000));

	const supabase = await createSupabaseServerClient();
	const { data: { user } } = await supabase.auth.getUser()
	const id = user?.id



	return supabase
		.from("govtblog")
		.select("*")
		.eq('author', id || " " )
		.order("created_at", { ascending: true });
		
}

export async function Coursebyadmin() {
	await new Promise((resolve) => setTimeout(resolve, 2000));

	const supabase = await createSupabaseServerClient();

	return supabase
		.from("course")
		.select("*")
		.eq('instructor', '5023e815-5c4a-4cfe-8607-18c263d0fbe3' )
		.order("created_at", { ascending: true });
		
}

export async function readBlogById(blogId: number) {
	const supabase = await createSupabaseServerClient();
	return supabase.from("govtblog").select("*").eq("id", blogId).single();
}
export async function readBlogIds() {
	const supabase = await createSupabaseServerClient();
	return supabase.from("govtblog").select("id");
}

export async function readBlogDeatailById(id : string) {
	const supabase = await createSupabaseServerClient();
	return await supabase
		.from("govtblog")
		.select("*")
		.eq("slug", id)
		.single();
}

export async function readcoursebyid(id : string) {
	const supabase = await createSupabaseServerClient();
	return await supabase
		.from("course")
		.select("*")
		.eq("slug", id)
		.single();
}
export async function readchapterdetailsbyid(id : string) {
	const supabase = await createSupabaseServerClient();
	return await supabase
		.from("chapters")
		.select("*")
		.eq("slug", id)
		.single();
}

export async function coursedetailsbyid(id : string) {
	const supabase = await createSupabaseServerClient();
	return await supabase
		.from("course")
		.select("*")
		.eq("slug", id)
		.single();
}



export async function getallimages() {
	const supabase = await createSupabaseServerClient();
	return await supabase.storage.from("images").list('images');
}

// export async function readBlogContent(blogId: string) {
// 	unstable_noStore();
// 	const supabase = await createSupabaseServerClient();
// 	return await supabase
// 		.from("blog_content")
// 		.select("content")
// 		.eq("blog_id", blogId)
// 		.single();
// }

export async function updateBlogById(blogId: string, data: IBlog) {
	const supabase = await createSupabaseServerClient();
	const result = await supabase.from("govtblog").update(data).eq("id", blogId);
	revalidatePath(DASHBOARD);
	revalidatePath("/blog/" + blogId);
	return JSON.stringify(result);
}

export async function deleteBlogById(blogId: string) {
	console.log("deleting blog post")
	const supabase = await createSupabaseServerClient();
	const result = await supabase.from("govtblog").delete().eq("id", blogId);
	console.log(result);
	revalidatePath(DASHBOARD);
	revalidatePath("/blog/" + blogId);	
	return JSON.stringify(result);
}
export async function deleteCoursebyid(course_id: string) {
	const supabase = await createSupabaseServerClient();
	const result = await supabase.from("course").delete().eq("id", course_id);
	console.log(result);
	revalidatePath(DASHBOARD);
	revalidatePath("/course/" + course_id);	
	return JSON.stringify(result);
}
export async function deleteModulebyid(mdoule_id: number) {
	const supabase = await createSupabaseServerClient();
	const result = await supabase.from("modules").delete().eq("id", mdoule_id);
	console.log(result);
	revalidatePath(DASHBOARD);
	revalidatePath("/course/" + mdoule_id);	
	return JSON.stringify(result);
}
export async function deletechapterbyid(chapter_id: number) {
	const supabase = await createSupabaseServerClient();
	const result = await supabase.from("chapters").delete().eq("id", chapter_id);
	console.log(result);
	revalidatePath(DASHBOARD);
	revalidatePath("/course/" + chapter_id);
	return JSON.stringify(result);
}



export async function readmodulesbycourseId(courseId: string) {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	const supabase = await createSupabaseServerClient();
	return supabase.from("modules").select("*").eq("course_id", courseId).order("module_number", { ascending: true });

}

export async function readchaptersbymodule(module_id: string) {
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("chapters")
		.select("module_id, chapter_name, slug, id, chapterno")
		.eq("module_id", module_id)
		.order("chapterno", { ascending: true });
}
export async function readchaptersbymodules(moduleIds: string[]) {
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("chapters")
		.select("module_id, chapter_name, slug, id, chapterno")
		.in("module_id", moduleIds)
		.order("chapterno", { ascending: true });
}
export async function updatemodulebyid(id: number, data: IModule) {
	await new Promise((resolve) => setTimeout(resolve, 2000));
	const supabase = await createSupabaseServerClient();
	const result = await supabase.from("modules").update(data).eq("id", id);
	revalidatePath(DASHBOARD);
	return JSON.stringify(result);
}