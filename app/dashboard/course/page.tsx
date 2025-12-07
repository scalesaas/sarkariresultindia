import React from 'react'
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";
import CourseTable from './compoennts/coursetable';

 export default function page() {
  return (
    <div className="space-y-8   h-screen	 px-8">
			<div className="flex items-center pt-[160px]  justify-between">
				<h1 className="text-3xl font-bold">course</h1>
				<Link href="/dashboard/course/create">
					<Button
						className="flex items-center gap-2 "
						variant="outline"
					>
						Create <PlusIcon />
					</Button>
				</Link>
			</div>
     <CourseTable/>
		</div>
  )
}