"use client"
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import supabase from "@/utils/supabase/supabase";
import { IModule } from "@/lib/types";
import slugify from "slugify";
import { createModule } from "@/lib/actions/blog";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

interface FormData {
  created_at?: string;
  module_name: string;
  module_description: string;
  module_number: number;
  course_id: string;
  slug: string;
}

interface Props {
  id: string;
}



function ALLchapters( { id  }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    created_at: "",
    module_name: "",
    module_description: "",
    module_number: 0,
    course_id: "",
    slug: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    const slugifiedName = slugify(`${updatedFormData.module_name}-${id}`);
    const date = new Date().toDateString().slice(0,16);
    setFormData({
      ...updatedFormData,
      slug: slugifiedName,
      course_id: id,
      created_at: date,
    });
  };

  console.log(formData);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Check if any required field is empty
    if (
      !formData.module_name ||
      !formData.module_description ||
      !formData.module_number ||
      !formData.course_id ||
      !formData.slug ||
      !formData.course_id 
    ) {
      console.error("Please fill in all fields");
      return;
    }
  
    try {
      const result = await createModule(formData);
      console.log("Module added successfully:", result);
      toast({
        title: "Successfully create a post 🎉",
        description: formData.module_name,
      });
      router.push(`/dashboard/course/build/${id}`);
      // Clear the form fields after successful submission
      setFormData({
        module_name: "",
        module_description: "",
        module_number: 0,
        course_id: "",
        slug: "",
        created_at: "",
      });
    } catch (error) {
      console.error("Error adding module:", error);
    }
  };

  return (
    <div className="bg-secondary rounded-md px-4 py-4">
      <form className="relative w-[800px]" onSubmit={handleSubmit}>
        <label htmlFor="module_name">
          Module name
          <Input
            name="module_name"
            type="text"
            placeholder="Enter module name"
            value={formData.module_name}
            onChange={handleChange}
          />
        </label>
        <label className="mt-6" htmlFor="module_description">
          Description
          <Input
            className="mt-4"
            name="module_description"
            type="text"
            placeholder="Module description"
            value={formData.module_description}
            onChange={handleChange}
          />
        </label>
        <label className="mt-6" htmlFor="module_number">
          Module No
          <Input
            className="mt-4"
            name="module_number"
            type="number"
            placeholder="Module No"
            value={formData.module_number}
            onChange={handleChange}
          />
        </label>
        <Button
          className="flex mt-10 justify-center item-center px-2 py-2"
          variant="outline"
          type="submit"
        >
          Add Module
        </Button>
      </form>
    </div>
  );
}

export default ALLchapters;