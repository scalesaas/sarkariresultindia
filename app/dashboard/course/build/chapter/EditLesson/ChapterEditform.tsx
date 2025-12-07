"use client"
import React from "react";
import { toast } from "@/components/ui/use-toast";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { updatechapter } from "@/lib/actions/blog";
import { Chapterformschematype } from "@/app/dashboard/blog/schema";
import { useRouter } from "next/navigation";
import Editchapterform from "@/app/dashboard/course/compoennts/Editchapterform";
import { IchapterDetails } from "@/lib/types";
export default function updatechapterform({chapter} : {chapter: IchapterDetails} ) {
	const router = useRouter();

	const onchaptersubmit = async (data: Chapterformschematype) => {
				try {
			const result = await updatechapter(chapter?.id!, data);	

			console.log("updating process start")
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
					description: data.chapter_name,
				});
				router.push(`/dashboard/course/build/${chapter.course_id}`);
			}
		} catch (error) {
			console.error("Error occurred while handling submit:", error);
			// Handle error appropriately, such as displaying an error message to the user
		}
	};
	return (
		<div className="pt-[60px]">
	{/* <NewBlogForm/> */}

		<Editchapterform
			onchaptersubmit={onchaptersubmit}
			defaultlesson={chapter}
			/>
			</div>
	);

}
