import type { 
  ReactNode 
} from "react"

/** 
 * Page hero content types.
 */
export type PageHeroType = 
  | "text"
  | "image"
  | "video"
  | "slideshow"
  | "custom"

export interface HeroCTA {
  label: string
  url: string
  icon?: ReactNode
}

export interface HeroTextPayload {
  title: string
  description: string
  button_label: string
  button_url: string
}

export interface HeroImagePayload {
  image_url: string | null
  image_media_id: string | null
  image_alt: string | null
  title: string | null
  description: string | null
  cta?: HeroCTA
}

export interface HeroVideoPayload {
  video_url: string
  video_media_id: string
  video_alt: string
  video_poster_url: string | null
  video_poster_media_id: string | null
  title: string
  description: string
  cta?: HeroCTA
}

export type HeroPayloads = {
  "text": HeroTextPayload
  "image": HeroImagePayload
  "video": HeroVideoPayload
  "slideshow": HeroSlideshowPayload
}

export type HeroSlideshowSlide<K extends keyof HeroPayloads = "image" | "video"> = {
  type: K
  slideData: HeroPayloads[K]
}

export interface HeroSlideshowPayload {
  slides: HeroSlideshowSlide[]
}

export interface HeroObject<T extends keyof HeroPayloads> {
  type: T
  payload: HeroPayloads[T]
  constrain_to_container: boolean
}