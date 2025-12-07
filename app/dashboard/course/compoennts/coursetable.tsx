import React from "react";
import { EyeOpenIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { BsBuilding } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IBlog } from "@/lib/types";
import SwitchForm from "./SwitchForm";
import DeleteAlert from "./DeleteAlert";
import { Coursebyadmin, updateBlogById } from "@/lib/actions/blog";

export default async function CourseTable() {
    const { data: course } = await Coursebyadmin();

	return (
		<>
			<div className="rounded-md bg-graident-dark border-[0.5px] overflow-y-scroll ">
				<div className="w-[800px] md:w-full">
					<div className="grid grid-cols-6 border-b p-5 dark:text-gray-500">
						<h1 className=" col-span-2">Title</h1>
					</div>
					<div className="space-y-10 p-5">
						{course?.map((courses, index) => {
							
							return (
								<div className="grid grid-cols-3" key={index}>
									<h1 className="dark:text-gray-200 col-span-2 font-lg font-medium">
										{courses.Name}
									</h1>

									<Actions id={courses.id } slug={courses.slug} />
								</div>
							);	
						})}
					</div>
				</div>
			</div>
		</>
	);
}

const Actions = ({ id, slug }: { id: string; slug: string } ) => {
	return (
		<div className="flex items-center px-4 gap-2 md:flex-wrap">
			{/* TODO: change to id */}
			<Link href={`/courses/${slug}`}>
				<Button className="flex gap-2 items-center" variant="outline">
					<EyeOpenIcon />
					View
				</Button>
			</Link>
		
			<DeleteAlert id={id} />
			<Link href={`/dashboard/course/edit/${slug}`}>
				<Button className="flex gap-2 items-center" variant="outline">
					<Pencil1Icon />
					Edit
				</Button>
			</Link>

			<Link href={`/dashboard/course/build/${slug}`}>
				<Button className="flex gap-2 items-center" variant="outline">
					<BsBuilding />
					Build
				</Button>
			</Link>
		</div>
	);
};
