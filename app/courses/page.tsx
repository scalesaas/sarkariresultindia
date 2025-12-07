import Link from "next/link";
import React from "react";
import Image from "next/image";
import { readcourse } from "@/lib/actions/blog";
import Navbar from "../navbar/navbar";
    export default async function page() {
	let { data: Courses } = await readcourse();

	if (!Courses?.length) {
		Courses = [];
	}

	return (
		<div>
				<div className="pb-[130px] px-2">
				<Navbar/>
			</div>

	
		<div className="md:px-4 px-2">	
			<div className="w-full grid grid-cols-1 md:pt-[170px] pt-2 md:grid-cols-3 gap-5   xl:p-0">
		
			{Courses.map((course, index) => {
				return (
				
					<Link
						href={"/courses/"  + course.slug}
						className="w-full  border rounded-md  dark:bg-graident-dark p-5 hover:ring-2 ring-green-500 transition-all cursor-pointer space-y-5 first:lg:col-span-2 first:md:col-span-3"
						key={index}
					>
						<div className="w-full h-72 sm:w-full  md:h-64 xl:h-96  relative">
							<Image
								priority
								src={course.banner_image}
								alt="cover"
								fill
								className=" rounded-md object-center"
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							/>
						</div>
						<div className="space-y-2">
							<p className="text-sm dark:text-gray-400">
								{new Date(course.created_at).toDateString()}
							</p>

							<h1 className="text-xl font-bold dark:text-gray-300">
								{course.Name}
							</h1>
						</div>
					</Link>
				);
			})}
		</div>
		</div>
		</div>
	);
}
