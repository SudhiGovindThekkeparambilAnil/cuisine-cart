"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function uploadImage(formData: FormData) {
  const file = formData.get("image") as File;

  if (!file) {
    throw new Error("No file uploaded");
  }

  const blob = await put(file.name, file, { access: "public" });

  revalidatePath("/");

  return blob.url; // Return the URL instead of entire blob object
}
