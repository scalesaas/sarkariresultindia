import React from "react";
import Updatechapterform from "../ChapterEditform";

import { IchapterDetails } from "@/lib/types";
import { readchapterdetailsbyid } from "@/lib/actions/blog";

export default async function Edit({ params }: { params: { id: string } }) {
	const { data: chapter } = await readchapterdetailsbyid(params.id);

	return <Updatechapterform chapter={chapter as IchapterDetails} />;
}