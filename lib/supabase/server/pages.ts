import { createClient } from "@/app/supabase/services/server"


export type PageRenderMode = "whole" | "sections"

export type CmsPage = {
  id: string
  author_id: string
  title: string
  slug: string
  summary: string | null
  content: unknown
  render_mode: PageRenderMode
  hero_image_enabled: boolean
  hero_image_url: string | null
  hero_image_alt: string | null
  hero_constrain_to_container: boolean
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Get a single page by slug
 */
export const getPageBySlug = async (slug: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle()

  if (error) {
    console.error("Error fetching page by slug:", error)
    return null
  }

  return data as unknown as CmsPage | null
}

interface GetPagesOptions {
  order?: "asc" | "desc"
  orderBy?: "created_at" | "updated_at"
  limit?: number
  offset?: number
  publishedOnly?: boolean
}

/**
 * Get multiple pages with pagination and filtering
 */
export const getPages = async (options?: GetPagesOptions) => {
  const supabase = await createClient()

  const { 
    order = "desc", 
    orderBy = "created_at", 
    limit = 10, 
    offset = 0,
    publishedOnly = true
  } = options || {}

  let query = supabase
    .from("pages")
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
    console.error("Error fetching pages:", error)
    return null
  }

  return data as unknown as CmsPage[]
}
