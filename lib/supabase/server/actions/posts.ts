"use server"

import { createClient } from "@/app/supabase/services/server"
import { revalidatePath } from "next/cache"
import type { Json, TablesInsert, TablesUpdate } from "@/lib/supabase/types"

type PostInsert = TablesInsert<"posts">
type PostUpdate = TablesUpdate<"posts">

type CreatePostData = Omit<
  PostInsert,
  "id" | "author_id" | "created_at" | "updated_at" | "published_at" | "content"
> & {
  content: Json
}

type UpdatePostData = {
  id: string
} & Omit<PostUpdate, "id" | "author_id" | "created_at" | "updated_at">

export async function createPost(data: CreatePostData) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Unauthorized" }
  }

  const postData: PostInsert = {
    ...data,
    author_id: user.id,
    published_at: data.is_published ? new Date().toISOString() : null,
  }

  const { data: post, error } = await supabase.from("posts").insert(postData).select().single()

  if (error) {
    console.error("Error creating post:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/posts")
  revalidatePath(`/posts/${data.slug}`)

  return { data: post }
}

export async function updatePost(data: UpdatePostData) {
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
  const { data: existingPost } = await supabase
    .from("posts")
    .select("author_id, slug")
    .eq("id", data.id)
    .single()

  if (!existingPost || existingPost.author_id !== user.id) {
    return { error: "Unauthorized" }
  }

  const updateData: Omit<PostUpdate, "id" | "author_id" | "created_at" | "updated_at"> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.slug !== undefined) updateData.slug = data.slug
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt
  if (data.content !== undefined) updateData.content = data.content
  if (data.featured_image !== undefined) updateData.featured_image = data.featured_image
  if (data.is_published !== undefined) {
    updateData.is_published = data.is_published
    if (data.is_published && !data.published_at) {
      updateData.published_at = new Date().toISOString()
    } else if (!data.is_published) {
      updateData.published_at = null
    }
  }
  if (data.published_at !== undefined) updateData.published_at = data.published_at

  const { data: post, error } = await supabase
    .from("posts")
    .update(updateData)
    .eq("id", data.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating post:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/posts")
  revalidatePath(`/posts/${existingPost.slug}`)
  if (data.slug && data.slug !== existingPost.slug) {
    revalidatePath(`/posts/${data.slug}`)
  }

  return { data: post }
}

export async function getPostById(id: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Unauthorized" }
  }

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("author_id", user.id)
    .single()

  if (error) {
    console.error("Error fetching post:", error)
    return { error: error.message }
  }

  return { data: post }
}

export async function deletePost(id: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Unauthorized" }
  }

  // Get post to get slug for revalidation
  const { data: post } = await supabase
    .from("posts")
    .select("slug")
    .eq("id", id)
    .single()

  const { error } = await supabase.from("posts").delete().eq("id", id).eq("author_id", user.id)

  if (error) {
    console.error("Error deleting post:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/posts")
  if (post) {
    revalidatePath(`/posts/${post.slug}`)
  }

  return { success: true }
}
