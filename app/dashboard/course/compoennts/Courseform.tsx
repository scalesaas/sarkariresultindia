import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useUser } from "@/lib/store/user";
import { useState } from "react";
import { IcourseSubmit } from "@/lib/types";
import { useForm } from "react-hook-form";
import { BsSave } from "react-icons/bs";
import { readCatogries } from "@/lib/actions/blog";
import { Catagories } from "@/lib/types";
import slugify from "slugify";

interface CourseFormProps {
  onHandleSubmit: (data: IcourseSubmit) => void;
  defaultCourse: IcourseSubmit;
}

export default function Courseform({
  onHandleSubmit,
  defaultCourse,
}: CourseFormProps) {
  const user = useUser((state) => state.user);
  const [formValues, setFormValues] = useState<IcourseSubmit>(defaultCourse);
  const [categories, setCategories] = useState<Catagories[]>([]);

  const form = useForm<IcourseSubmit>({
    defaultValues: formValues,
  });

  useEffect(() => {
    // Fetch categories from Supabase backend
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: Catagories } = await readCatogries();
      if (Catagories) {
        setCategories(Catagories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = (data: IcourseSubmit) => {
    if (user?.id) {
      const instructor = user?.id;
      const slug = slugify(form.getValues().Name, { lower: true }) + instructor;
      const created_at = new Date().toISOString().slice(0, 16);
      const newData = { ...data, instructor,  created_at, slug };
      console.log("this is data " , newData)
      onHandleSubmit(newData);
    }
  };

  useEffect(() => {
    if (user?.id) {
      const instructor = user?.id;
      const Catogory_id = "";
      setFormValues({
        ...formValues,
        instructor,
        Catogory_id,
        created_at: new Date().toISOString().slice(0, 16),
      });
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Create New Course</h1>
            <p className="text-blue-100 mt-1">Fill in the details to create your course</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
            {/* Save Button */}
            <div className="flex justify-end mb-6">
              <button
                type="submit"
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200",
                  "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg",
                  "disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400 disabled:shadow-none"
                )}
                disabled={!form.formState.isValid}
              >
                <BsSave className="w-4 h-4" />
                Save Course
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Banner Image */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700" htmlFor="banner_image">
                  Banner Image URL
                </label>
                <Input
                  id="banner_image"
                  placeholder="https://example.com/banner-image.jpg"
                  {...form.register("banner_image")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  type="url"
                />
              </div>

              {/* Course Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700" htmlFor="Name">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="Name"
                  placeholder="Enter course name"
                  {...form.register("Name", { required: true })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Course Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700" htmlFor="Description">
                  Course Description
                </label>
                <textarea
                  id="Description"
                  placeholder="Describe what students will learn in this course..."
                  {...form.register("Description")}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Two Column Layout for Category and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700" htmlFor="Category">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="catagory_id"
                    {...form.register("Catogory_id", { required: true })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700" htmlFor="price">
                    Course Price ($)
                  </label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    {...form.register("price", { min: 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-600">
                  Fields marked with <span className="text-red-500">*</span> are required
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={cn(
                      "flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200",
                      "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg",
                      "disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400 disabled:shadow-none"
                    )}
                    disabled={!form.formState.isValid}
                  >
                    <BsSave className="w-4 h-4" />
                    Create Course
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}