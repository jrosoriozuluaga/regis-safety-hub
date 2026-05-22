import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Open a file from Supabase Storage using a signed URL.
 *  Handles both full URLs and relative paths. */
export async function openStorageFile(archivoUrl: string) {
  let path = archivoUrl;
  // Extract path if it's a full URL
  if (path.includes("/documentos/")) {
    path = path.split("/documentos/").pop() || path;
  }
  // Remove query params from old signed URLs
  if (path.includes("?token=")) {
    path = path.split("?token=")[0];
  }
  if (path.includes("?")) {
    path = path.split("?")[0];
  }
  const { data, error } = await supabase.storage
    .from("documentos")
    .createSignedUrl(path, 3600);
  if (data?.signedUrl) {
    window.open(data.signedUrl, "_blank");
  } else {
    console.error("Error creating signed URL:", error);
    toast.error("No se pudo abrir el archivo");
  }
}
