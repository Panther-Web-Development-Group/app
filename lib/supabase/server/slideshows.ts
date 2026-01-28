import { createClient } from "@/app/supabase/services/server"
import type { SlideshowSlide } from "@/app/components/Slideshow"

export type Slideshow = {
  id: string
  owner_id: string
  title: string
  description: string | null
  autoplay: boolean
  autoplay_interval_ms: number
  loop: boolean
  show_controls: boolean
  show_indicators: boolean
  is_active: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

/**
 * Get a single slideshow by ID with its slides
 */
export const getSlideshowById = async (id: string) => {
  const supabase = await createClient()

  const { data: slideshow, error: slideshowError } = await supabase
    .from("slideshows")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .eq("is_public", true)
    .maybeSingle()

  if (slideshowError || !slideshow) {
    console.error("Error fetching slideshow:", slideshowError)
    return null
  }

  const { data: slides, error: slidesError } = await supabase
    .from("slideshow_slides")
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
    .eq("slideshow_id", id)
    .order("order_index", { ascending: true })

  if (slidesError) {
    console.error("Error fetching slideshow slides:", slidesError)
    return {
      slideshow: slideshow as Slideshow,
      slides: [] as SlideshowSlide[],
    }
  }

  const slideshowSlides: SlideshowSlide[] =
    slides?.map((slide: any) => ({
      id: slide.id,
      order_index: slide.order_index,
      caption: slide.caption,
      link_href: slide.link_href,
      media_asset: {
        id: slide.media_asset.id,
        file_url: slide.media_asset.file_url,
        filename: slide.media_asset.filename,
        alt_text: slide.media_asset.alt_text,
        asset_type: slide.media_asset.asset_type,
      },
    })) || []

  return {
    slideshow: slideshow as Slideshow,
    slides: slideshowSlides,
  }
}

/**
 * Get multiple slideshows
 */
export const getSlideshows = async (options?: {
  limit?: number
  orderBy?: "created_at" | "updated_at"
  order?: "asc" | "desc"
}) => {
  const supabase = await createClient()

  const { limit = 10, orderBy = "updated_at", order = "desc" } = options || {}

  const { data, error } = await supabase
    .from("slideshows")
    .select("*")
    .eq("is_active", true)
    .eq("is_public", true)
    .order(orderBy, { ascending: order === "asc" })
    .limit(limit)

  if (error) {
    console.error("Error fetching slideshows:", error)
    return []
  }

  return (data || []) as Slideshow[]
}
