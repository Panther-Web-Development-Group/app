import type { ReactNode } from "react"
import type { HeroCTA } from "./hero-slides"

/**
 * Page section content types.
 */
export type PageSectionType =
  | "hero"
  | "card"
  | "richText"
  | "gallery"
  | "slideshow"
  | "events"
  | "custom"

export interface SectionHeroPayload {
  headline: string
  subheadline?: string | null
  thumbnail?: string | null
  thumbnails?: string[] | null
  cta?: HeroCTA
}

export interface SectionCardPayload {
  title: string
  body: string
  thumbnail?: string | null
  thumbnails?: string[] | null
  link_href?: string | null
}

export interface SectionRichTextPayload {
  html: string
}

export interface SectionGalleryPayload {
  gallery_id: string
  layout?: "grid" | "masonry" | "carousel" | "lightbox"
  columns?: number
  gap?: number
  show_captions?: boolean
}

export interface SectionSlideshowPayload {
  slideshow_id: string
  autoplay?: boolean
  interval?: number
  show_controls?: boolean
  show_indicators?: boolean
}

export interface SectionEventsPayload {
  category_id?: string | null
  limit?: number
  show_past?: boolean
  featured_only?: boolean
}

export type PageSectionPayloads = {
  "hero": SectionHeroPayload
  "card": SectionCardPayload
  "richText": SectionRichTextPayload
  "gallery": SectionGalleryPayload
  "slideshow": SectionSlideshowPayload
  "events": SectionEventsPayload
  "custom": Record<string, unknown>
}

export interface PageSectionObject<T extends keyof PageSectionPayloads> {
  type: T
  payload: PageSectionPayloads[T]
}
