"use client";
import React from "react";
import { toast } from "@/components/ui/use-toast";
import { defaultcoursenew } from "@/lib/data";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import Courseform from "../compoennts/Courseform";
import { createCourse } from "../../../../lib/actions/blog";
import { useRouter } from "next/navigation";
import {  CourseFormSchematype } from "../../blog/schema";

export default function CreateForm() {
	const router = useRouter();

	const onHandleSubmit = async (data: CourseFormSchematype) => {
		try {
			const result = await createCourse(data);	
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
					description: data.Name,
				});
				router.push("/dashboard/course");
			}
		} catch (error) {
			console.error("Error occurred while handling submit:", error);
			// Handle error appropriately, such as displaying an error message to the user
		}
	};
	return (
		<Courseform
		onHandleSubmit={onHandleSubmit}
			defaultCourse={defaultcoursenew}
		/>
	);
}
