import React from "react";
import BlogTable from "./blog/components/BlogTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "../navbar/navbar";

export default function Blog() {
	const dashboardSections = [
		{
			title: "Blogs",
			description: "Manage your blog posts and articles",
			href: "/dashboard/blog",
			buttonText: "My Blogs ",
			count: "12 posts"
		},
		{
			title: "Courses",
			description: "Create and manage your online courses",
			href: "/dashboard/course",
			buttonText: "My Courses",
			count: "5 courses"
		},
		{
			title: "Images",
			description: "Upload and organize your media files",
			href: "/dashboard/images",
			buttonText: "ALL Images",
			count: "248 files"
		}
	];

	return (
		<div className="min-h-screen bg-gray-50/50">
			<Navbar/>
			{/* Header */}
			<div className="bg-white border-b border-gray-200 sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
							<p className="text-sm text-gray-600">Manage your content and resources</p>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Stats Overview */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					{dashboardSections.map((section, index) => (
						<Card key={index} className="hover:shadow-lg transition-shadow duration-200">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg font-semibold text-gray-900">
										{section.title}
									</CardTitle>
									<span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
										{section.count}
									</span>
								</div>
								<p className="text-sm text-gray-600 mt-1">
									{section.description}
								</p>
							</CardHeader>
							<CardContent className="pt-0">
								<Link href={section.href} className="block">
									<Button 
										className="w-full flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
										variant="default"
									>
										{section.buttonText} <PlusIcon className="h-4 w-4" />
									</Button>
								</Link>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Recent Activity Section */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200">
					<div className="px-6 py-4 border-b border-gray-200">
						<h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
						<p className="text-sm text-gray-600">Your latest blog posts and updates</p>
					</div>
					<div className="p-6">
						<BlogTable />
					</div>
				</div>

				{/* Quick Actions */}
				<div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
					<div className="px-6 py-4 border-b border-gray-200">
						<h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
					</div>
					<div className="p-6">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							<Link href="/dashboard/blog/create">
								<Button variant="outline" className="w-full h-12 flex items-center justify-center gap-2 hover:bg-gray-50">
									<PlusIcon className="h-4 w-4" />
									Create New Blog Post
								</Button>
							</Link>
							<Link href="/dashboard/course/create">
								<Button variant="outline" className="w-full h-12 flex items-center justify-center gap-2 hover:bg-gray-50">
									<PlusIcon className="h-4 w-4" />
									Create New Course
								</Button>
							</Link>
							<Link href="/dashboard/images">
								<Button variant="outline" className="w-full h-12 flex items-center justify-center gap-2 hover:bg-gray-50">
									<PlusIcon className="h-4 w-4" />
									Upload Images
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}