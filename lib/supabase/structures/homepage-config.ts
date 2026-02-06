import type { HeroPayloads } from "./hero-slides"

/**
 * Homepage hero content types.
 */
export type HomepageHeroType = "text" | "image" | "slideshow"

/**
 * About content structure for homepage.
 */
export interface AboutContentPayload {
  title: string | null
  body: string | null
  image_url: string | null
  image_media_id: string | null
}

/**
 * Additional section types for homepage.
 */
export type AdditionalSectionType = "rich_text" | "stats" | "testimonials" | "features"

export interface AdditionalSectionRichText {
  type: "rich_text"
  title: string
  body: string
}

export interface StatItem {
  label: string
  value: string | number
  icon?: string | null
  description?: string | null
}

export interface AdditionalSectionStats {
  type: "stats"
  title: string
  stats: StatItem[]
}

export interface TestimonialItem {
  quote: string
  author: string
  role?: string | null
  avatar_url?: string | null
  company?: string | null
}

export interface AdditionalSectionTestimonials {
  type: "testimonials"
  title: string
  testimonials: TestimonialItem[]
}

export interface FeatureItem {
  title: string
  description: string
  icon?: string | null
  image_url?: string | null
  image_media_id?: string | null
  link_href?: string | null
}

export interface AdditionalSectionFeatures {
  type: "features"
  title: string
  features: FeatureItem[]
}

export type AdditionalSectionPayloads = {
  "rich_text": AdditionalSectionRichText
  "stats": AdditionalSectionStats
  "testimonials": AdditionalSectionTestimonials
  "features": AdditionalSectionFeatures
}

export interface AdditionalSectionObject<T extends keyof AdditionalSectionPayloads> {
  type: T
  payload: AdditionalSectionPayloads[T]
}

/**
 * Homepage config hero structure.
 * Reuses HeroPayloads from hero-slides.ts but limited to homepage-supported types.
 */
export type HomepageHeroPayload = HeroPayloads[HomepageHeroType]

export interface HomepageHeroObject {
  type: HomepageHeroType
  payload: HomepageHeroPayload
}
