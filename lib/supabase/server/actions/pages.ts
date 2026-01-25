"use server"

import { createClient } from "@/app/supabase/services/server"
import { revalidatePath } from "next/cache"
import type { Json, TablesInsert, TablesUpdate } from "@/lib/supabase/types"

type PageInsert = TablesInsert<"pages">
type PageUpdate = TablesUpdate<"pages">

type CreatePageData = Omit<
  PageInsert,
  "id" | "author_id" | "created_at" | "updated_at" | "published_at" | "content"
> & {
  // Stored in the DB as jsonb, so keep it JSON-serializable.
  content: Json
}

type UpdatePageData = {
  id: string
} & Omit<PageUpdate, "id" | "author_id" | "created_at" | "updated_at">

export async function createPage(data: CreatePageData) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Unauthorized" }
  }

  const pageData: PageInsert = {
    ...data,
    author_id: user.id,
    published_at: data.is_published ? new Date().toISOString() : null,
  }

  const { data: page, error } = await supabase.from("pages").insert(pageData).select().single()

  if (error) {
    console.error("Error creating page:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/pages")
  revalidatePath(`/${data.slug}`)

  return { data: page }
}

export async function updatePage(data: UpdatePageData) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Unauthorized" }
  }

  // Verify ownership
  const { data: existingPage } = await supabase
    .from("pages")
    .select("author_id, slug")
    .eq("id", data.id)
    .single()

  if (!existingPage || existingPage.author_id !== user.id) {
    return { error: "Unauthorized" }
  }

  const updateData: Omit<PageUpdate, "id" | "author_id" | "created_at" | "updated_at"> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.slug !== undefined) updateData.slug = data.slug
  if (data.summary !== undefined) updateData.summary = data.summary
  if (data.content !== undefined) updateData.content = data.content
  if (data.is_published !== undefined) {
    updateData.is_published = data.is_published
    if (data.is_published && !data.published_at) {
      updateData.published_at = new Date().toISOString()
    } else if (!data.is_published) {
      updateData.published_at = null
    }
  }
  if (data.published_at !== undefined) updateData.published_at = data.published_at

  const { data: page, error } = await supabase
    .from("pages")
    .update(updateData)
    .eq("id", data.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating page:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/pages")
  revalidatePath(`/${existingPage.slug}`)
  
  if (data.slug && data.slug !== existingPage.slug) {
    revalidatePath(`/${data.slug}`)
  }

  return { data: page }
}

export async function getPageById(id: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Unauthorized" }
  }

  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .eq("author_id", user.id)
    .single()

  if (error) {
    console.error("Error fetching page:", error)
    return { error: error.message }
  }

  return { data: page }
}

export async function deletePage(id: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Unauthorized" }
  }

  // Get page to get slug for revalidation
  const { data: page } = await supabase
    .from("pages")
    .select("slug")
    .eq("id", id)
    .single()

  const { error } = await supabase.from("pages")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id)

  if (error) {
    console.error("Error deleting page:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/pages")
  if (page) {
    revalidatePath(`/${page.slug}`)
  }

  return { success: true }
}
