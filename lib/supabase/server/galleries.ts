import { createClient } from "@/app/supabase/services/server"
import type { GalleryItem } from "@/app/components/Gallery"

export type Gallery = {
  id: string
  owner_id: string
  title: string
  description: string | null
  is_active: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

/**
 * Get a single gallery by ID with its items
 */
export const getGalleryById = async (id: string) => {
  const supabase = await createClient()

  const { data: gallery, error: galleryError } = await supabase
    .from("galleries")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .eq("is_public", true)
    .maybeSingle()

  if (galleryError || !gallery) {
    console.error("Error fetching gallery:", galleryError)
    return null
  }

  const { data: items, error: itemsError } = await supabase
    .from("gallery_items")
    .select(
      `
      id,
      order_index,
      caption,
      link_href,
      media_asset:media_assets (
        id,
        file_url,
        filename,
        alt_text,
        asset_type
      )
    `
    )
    .eq("gallery_id", id)
    .order("order_index", { ascending: true })

  if (itemsError) {
    console.error("Error fetching gallery items:", itemsError)
    return { gallery: gallery as Gallery, items: [] as GalleryItem[] }
  }

  const galleryItems: GalleryItem[] =
    items?.map((item: any) => ({
      id: item.id,
      order_index: item.order_index,
      caption: item.caption,
      link_href: item.link_href,
      media_asset: {
        id: item.media_asset.id,
        file_url: item.media_asset.file_url,
        filename: item.media_asset.filename,
        alt_text: item.media_asset.alt_text,
        asset_type: item.media_asset.asset_type,
      },
    })) || []

  return {
    gallery: gallery as Gallery,
    items: galleryItems,
  }
}

/**
 * Get multiple galleries
 */
export const getGalleries = async (options?: {
  limit?: number
  orderBy?: "created_at" | "updated_at"
  order?: "asc" | "desc"
}) => {
  const supabase = await createClient()

  const { limit = 10, orderBy = "updated_at", order = "desc" } = options || {}

  const { data, error } = await supabase
    .from("galleries")
    .select("*")
    .eq("is_active", true)
    .eq("is_public", true)
    .order(orderBy, { ascending: order === "asc" })
    .limit(limit)

  if (error) {
    console.error("Error fetching galleries:", error)
    return []
  }

  return (data || []) as Gallery[]
}
