import React from "react";

import EditCourseForm from "../EditCourseForm";

import { Icourse } from "@/lib/types";
import { coursedetailsbyid } from "@/lib/actions/blog";

export default async function Edit({ params }: { params: { id: string } }) {
    const { data: course } = await coursedetailsbyid(params.id);
    return <EditCourseForm course={course as Icourse} />;
}