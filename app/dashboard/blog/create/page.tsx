"use client"
import React from "react";

import { toast } from "@/components/ui/use-toast";
import { defaultBlog } from "@/lib/data";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import BlogForm from "../components/BlogForm";
import { createBlog } from "../../../../lib/actions/blog";
import { BlogFormSchemaType } from "../schema";
import { useRouter } from "next/navigation";
import NewBlogForm from "../components/newBlogForm";

export default function CreateForm() {
	const router = useRouter();

	const onHandleSubmit = async (data: BlogFormSchemaType) => {
		console.log("submit button pressed")
		try {
			const result = await createBlog(data);	
			if (!result) {
				throw new Error("No response received from server.");
			}
	
			const parsedResult = result;
	
			const { error } = parsedResult as PostgrestSingleResponse<null>;
			if (error?.message) {
				toast({
					title: "Fail to create a post 😢",
					description: (
						<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
							<code className="text-white">{error.message}</code>
						</pre>
					),
				});
			} else {
				toast({
					title: "Successfully create a post 🎉",
					description: data.title,
				});
				router.push("/dashboard/blog");
			}
		} catch (error) {
			console.error("Error occurred while handling submit:", error);
			// Handle error appropriately, such as displaying an error message to the user
		}
	};
	return (
		<div className="">
	{/* <NewBlogForm/> */}


		<BlogForm
			onHandleSubmit={onHandleSubmit}
			defaultBlog={defaultBlog}
			/>

			</div>
	);

}
