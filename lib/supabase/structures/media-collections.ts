/**
 * Gallery layout types.
 */
export type GalleryLayout = "grid" | "masonry" | "carousel" | "lightbox"

/**
 * Gallery configuration payload.
 */
export interface GalleryConfigPayload {
  layout: GalleryLayout
  columns?: number // For grid/masonry layouts
  gap?: number // Gap between items in pixels
  show_captions?: boolean
  show_thumbnails?: boolean
  autoplay?: boolean // For carousel layout
  interval?: number // Autoplay interval in milliseconds
}

/**
 * Slideshow transition types.
 */
export type SlideshowTransition = "fade" | "slide" | "zoom" | "none"

/**
 * Slideshow configuration payload.
 * Note: This extends the database Slideshow type with additional UI configuration.
 */
export interface SlideshowConfigPayload {
  transition?: SlideshowTransition
  autoplay: boolean
  interval: number // milliseconds
  show_controls?: boolean
  show_indicators?: boolean
  loop?: boolean
}
