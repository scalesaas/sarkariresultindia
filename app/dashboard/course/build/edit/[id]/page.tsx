import React from "react";
import { SITE_URL } from "@/app/config";
import supabase from "@/utils/supabase/supabase";
import "react-quill/dist/quill.snow.css";
import ModuleForm from "../../../compoennts/EditModuleform";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default async function Page({ params }: { params: { id: string } }) {
  const { data: module, error } = await supabase
    .from("modules")
    .select("*")
    .eq("slug", params.id)
    .single();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error.code === 'PGRST116' 
              ? "Module not found. Please check the URL and try again."
              : "An error occurred while loading the module. Please try again later."
            }
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Module not found. Please check the URL and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-16 pb-8">
        <ModuleForm module={module}  />
      </div>
    </div>
  );
}