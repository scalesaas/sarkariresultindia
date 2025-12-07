"use client"
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import slugify from "slugify";
import { createModule } from "@/lib/actions/blog";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Plus, ArrowLeft } from "lucide-react";

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

function ModuleForm({ id }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    created_at: "",
    module_name: "",
    module_description: "",
    module_number: 1,
    course_id: id,
    slug: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    
    // Auto-generate slug when module name changes
    if (name === "module_name") {
      const slugifiedName = slugify(value, { lower: true, strict: true });
      updatedFormData.slug = slugifiedName;
    }
    
    setFormData({
      ...updatedFormData,
      course_id: id,
      created_at: new Date().toISOString(),
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validation
    if (
      !formData.module_name.trim() ||
      !formData.module_description.trim() ||
      !formData.module_number ||
      !formData.course_id
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await createModule(formData);
      
      toast({
        title: "Success! 🎉",
        description: `Module "${formData.module_name}" has been created successfully`,
      });
      
      router.push(`/dashboard/course/build/${id}`);
      
      // Clear form after successful submission
      setFormData({
        module_name: "",
        module_description: "",
        module_number: 1,
        course_id: id,
        slug: "",
        created_at: "",
      });
    } catch (error) {
      console.error("Error creating module:", error);
      toast({
        title: "Error",
        description: "Failed to create module. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push(`/dashboard/course/build/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create New Module</h1>
          <p className="text-muted-foreground">
            Add a new module to your course. All fields marked with * are required.
          </p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Module Information</CardTitle>
          <CardDescription>
            Fill in the details for your new module
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="module_name" className="text-sm font-medium">
                  Module Name *
                </Label>
                <Input
                  id="module_name"
                  name="module_name"
                  type="text"
                  placeholder="e.g., Introduction to React"
                  value={formData.module_name}
                  onChange={handleChange}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="module_number" className="text-sm font-medium">
                  Module Number *
                </Label>
                <Input
                  id="module_number"
                  name="module_number"
                  type="number"
                  placeholder="1"
                  value={formData.module_number}
                  onChange={handleChange}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="module_description" className="text-sm font-medium">
                Description *
              </Label>
              <Textarea
                id="module_description"
                name="module_description"
                placeholder="Provide a detailed description of what students will learn in this module..."
                value={formData.module_description}
                onChange={handleChange}
                className="min-h-[120px] resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-medium">
                URL Slug
              </Label>
              <Input
                id="slug"
                name="slug"
                type="text"
                placeholder="auto-generated-from-module-name"
                value={formData.slug}
                onChange={handleChange}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                This will be automatically generated from the module name
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Module Preview</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Name:</strong> {formData.module_name || "Not set"}</p>
                <p><strong>Number:</strong> {formData.module_number || "Not set"}</p>
                <p><strong>Slug:</strong> {formData.slug || "Not set"}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Module
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
                className="px-6 py-2"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ModuleForm;