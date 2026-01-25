import { createClient } from "@/app/supabase/services/server"

/**
 * Get a single post by slug
 */
export const getPostBySlug = async (slug: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle()

  if (error) {
    console.error("Error fetching post by slug:", error)
    return null
  }

  return data
}

interface GetPostsOptions {
  order?: "asc" | "desc"
  orderBy?: "created_at" | "updated_at"
  limit?: number
  offset?: number
  publishedOnly?: boolean
}

/**
 * Get multiple posts with pagination and filtering
 */
export const getPosts = async (options?: GetPostsOptions) => {
  const supabase = await createClient()

  const { 
    order = "desc", 
    orderBy = "created_at", 
    limit = 10, 
    offset = 0,
    publishedOnly = true
  } = options || {}

  let query = supabase
    .from("posts")
    .select("*")

  if (publishedOnly) query = query.eq("is_published", true)

  if (isFinite(limit) && limit > 0) {
    query = query.limit(limit)
  }

  if (isFinite(offset) && offset >= 0) {
    query = query.range(offset, offset + limit - 1)
  }

  const { data, error } = await query
    .order(orderBy, { ascending: order === "asc" })
    
  if (error) {
    console.error("Error fetching posts:", error)
    return null
  }

  return data
}
