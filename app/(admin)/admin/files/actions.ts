"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/app/supabase/services/server"

const STORAGE_BUCKET = "media" // Adjust this to your actual bucket name

function getAssetType(mimeType: string): "image" | "video" | "audio" | "document" | "other" {
  if (mimeType.startsWith("image/")) return "image"
  if (mimeType.startsWith("video/")) return "video"
  if (mimeType.startsWith("audio/")) return "audio"
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("document") ||
    mimeType.includes("text") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("presentation") ||
    mimeType.includes("zip") ||
    mimeType.includes("rar")
  ) {
    return "document"
  }
  return "other"
}

export async function uploadFileAssets(formData: FormData) {
  const file = formData.get("file") as File | null

  if (!file) {
    return { error: "No file provided" }
  }

  const supabase = await createClient()
  
  // Ensure session is active
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "You must be signed in to upload files" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.id) {
    return { error: "You must be signed in to upload files" }
  }

  try {
    // Generate a unique file path
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return { error: `Failed to upload file: ${uploadError.message}` }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)

    // Determine asset type and ensure mime_type is not empty
    const mimeType = file.type || "application/octet-stream"
    const assetType = getAssetType(mimeType)

    // Ensure filename is not empty
    if (!fileName || fileName.trim().length === 0) {
      return { error: "Invalid filename" }
    }

    // Create record in media_assets table
    const { error: dbError } = await supabase.from("media_assets").insert({
      owner_id: user.id,
      filename: fileName.trim(),
      original_filename: file.name || fileName.trim(),
      file_path: filePath.trim(),
      file_url: publicUrl.trim(),
      mime_type: mimeType.trim(),
      file_size: file.size,
      asset_type: assetType,
      is_active: true,
      is_public: true,
    })

    if (dbError) {
      console.error("Database insert error:", dbError)
      console.error("User ID:", user.id)
      console.error("Insert data:", {
        owner_id: user.id,
        filename: fileName.trim(),
        original_filename: file.name || fileName.trim(),
        file_path: filePath.trim(),
        file_url: publicUrl.trim(),
        mime_type: mimeType.trim(),
        file_size: file.size,
        asset_type: assetType,
      })
      // Try to clean up the uploaded file
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath])
      return { error: `Failed to create record: ${dbError.message}. Code: ${dbError.code}` }
    }

    revalidatePath("/admin/files")
    return { success: true }
  } catch (error) {
    console.error("Upload error:", error)
    return { error: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}
