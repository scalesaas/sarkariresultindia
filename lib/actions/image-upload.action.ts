"use server";
import {
  responseError,
  responseSuccess,
} from "@/lib/response/response-helper";
import { nanoid } from "nanoid";
import { z } from "zod";
import { imageUploadSchema } from "./validation/image-upload.validation";
import { createSupabaseServerClient } from "@/lib/supabase";

export const onUploadImageAction = async (form: FormData) => {
  const image = form.get("image") as File | null;

  console.log(image);

  if (!image) {
    throw new Error("No file uploaded");
  }

  // Validate the file using Zod
  try {
    imageUploadSchema.parse({ image });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((err) => err.message).join(", ");
      return responseError(message);
    } else {
      return responseError("Invalid file format");
    }
  }

  const uniqueId = nanoid();
  const imageName = `${uniqueId}_${image.name}`;

  // Convert the file to a buffer
  const fileBuffer = Buffer.from(await image.arrayBuffer());

  // Upload the image to Supabase Storage
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from('profiles')
    .upload(`uploads/${imageName}`, fileBuffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: image.type,
    });
 
  if (error) {
    return responseError("Failed to upload image to Supabase");
  }

  const publicUrl = supabase.storage.from('profiles').getPublicUrl(`uploads/${imageName}`).data.publicUrl;
   console.log(publicUrl)

  return responseSuccess("File uploaded successfully", {
    path: publicUrl,

   
  });
};
