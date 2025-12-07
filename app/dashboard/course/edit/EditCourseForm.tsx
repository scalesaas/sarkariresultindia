"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import slugify from "slugify";
import { Icourse } from "@/lib/types";
import { updateCoursebyid } from "@/lib/actions/blog";

interface EditCourseFormProps {
  course: Icourse;
}

export default function EditCourseForm({ course }: EditCourseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: course.id,
    created_at: course.created_at,
    Name: course.Name || "",
    Description: course.Description || "",
    instructor: course.instructor || "",
    slug: course.slug || "",
    price: course.price || "",
    Catogory_id: course.Catogory_id || "",
    banner_image: course.banner_image || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };

    // Auto-generate slug when Name changes
    if (name === "Name") {
      const slugnew = slugify(value, { lower: true }) + course.instructor;
      updatedForm.slug = slugnew;
    }

    setFormData(updatedForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { Name, Description, instructor } = formData;

    if (!Name.trim() || !Description.trim() || !instructor.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await updateCoursebyid(course.id, formData);

      toast({
        title: "Course Updated 🎉",
        description: `"${Name}" has been updated successfully.`,
      });

      router.push(`/dashboard/course/build/${course.slug}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Update Failed ❌",
        description: "Something went wrong while updating the course.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <h1 className="text-3xl font-bold mb-6">Edit Course</h1>

      <Card>
        <CardHeader>
          <CardTitle>Edit Course Details</CardTitle>
          <CardDescription>Update the course information below.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="Name">Course Name *</Label>
                <Input
                  id="Name"
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter course name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor *</Label>
                <Input
                  id="instructor"
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter instructor name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="Description">Description *</Label>
              <Textarea
                id="Description"
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Enter course description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="course-slug"
                />
                <p className="text-sm text-muted-foreground">
                  Auto-generated from course name
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="Catogory_id">Category ID</Label>
                <Input
                  id="Catogory_id"
                  name="Catogory_id"
                  value={formData.Catogory_id}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter category ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner_image">Banner Image URL</Label>
                <Input
                  id="banner_image"
                  name="banner_image"
                  type="url"
                  value={formData.banner_image}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}