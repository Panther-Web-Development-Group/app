"use client"

import { FC, useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/cn"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/app/components/Button"

export interface SlideshowSlide {
  id: string
  media_asset: {
    id: string
    file_url: string
    filename: string
    alt_text?: string | null
    asset_type: "image" | "video" | "audio" | "document" | "other"
  }
  caption?: string | null
  link_href?: string | null
  order_index: number
}

export interface SlideshowProps {
  title?: string
  description?: string
  slides: SlideshowSlide[]
  autoplay?: boolean
  autoplayInterval?: number
  loop?: boolean
  showControls?: boolean
  showIndicators?: boolean
  className?: string
}

export const Slideshow: FC<SlideshowProps> = ({
  title,
  description,
  slides,
  autoplay = true,
  autoplayInterval = 5000,
  loop = true,
  showControls = true,
  showIndicators = true,
  className,
}) => {
  const sortedSlides = [...slides].sort((a, b) => a.order_index - b.order_index)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goToSlide = useCallback(
    (index: number) => {
      if (sortedSlides.length === 0) return
      if (loop) {
        setCurrentIndex(index % sortedSlides.length)
      } else {
        setCurrentIndex(Math.max(0, Math.min(index, sortedSlides.length - 1)))
      }
    },
    [sortedSlides.length, loop]
  )

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1)
  }, [currentIndex, goToSlide])

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1)
  }, [currentIndex, goToSlide])

  // Autoplay
  useEffect(() => {
    if (!autoplay || isPaused || sortedSlides.length <= 1) return

    const interval = setInterval(() => {
      nextSlide()
    }, autoplayInterval)

    return () => clearInterval(interval)
  }, [autoplay, autoplayInterval, isPaused, nextSlide, sortedSlides.length])

  if (sortedSlides.length === 0) {
    return (
      <div className={cn("rounded-lg border border-(--pw-border) bg-background/10 p-12 text-center", className)}>
        <p className="text-sm text-foreground/75">No slides in this slideshow.</p>
      </div>
    )
  }

  const currentSlide = sortedSlides[currentIndex]
  const isImage = currentSlide.media_asset.asset_type === "image"
  const isVideo = currentSlide.media_asset.asset_type === "video"

  return (
    <div
      className={cn("space-y-4", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {title && (
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {description && (
            <p className="mt-2 text-sm text-foreground/75">{description}</p>
          )}
        </div>
      )}

      <div className="relative rounded-lg border border-(--pw-border) bg-background/10 overflow-hidden">
        {/* Slide Content */}
        <div className="relative aspect-video bg-background/5">
          {isImage ? (
            <img
              src={currentSlide.media_asset.file_url}
              alt={currentSlide.media_asset.alt_text || currentSlide.caption || currentSlide.media_asset.filename}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : isVideo ? (
            <video
              src={currentSlide.media_asset.file_url}
              className="w-full h-full object-cover"
              controls
              autoPlay={autoplay && !isPaused}
              loop={loop}
            />
          ) : null}

          {/* Caption Overlay */}
          {currentSlide.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4">
              <p className="text-sm font-medium text-white">{currentSlide.caption}</p>
            </div>
          )}

          {/* Navigation Controls */}
          {showControls && sortedSlides.length > 1 && (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 hover:bg-background text-foreground shadow-sm border border-(--pw-border)/50"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 hover:bg-background text-foreground shadow-sm border border-(--pw-border)/50"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Link Overlay */}
          {currentSlide.link_href && (
            <Link
              href={currentSlide.link_href}
              className="absolute inset-0 z-10"
              aria-label={currentSlide.caption || "View link"}
            />
          )}
        </div>

        {/* Indicators */}
        {showIndicators && sortedSlides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {sortedSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentIndex
                    ? "w-8 bg-accent"
                    : "w-2 bg-background/50 hover:bg-background/70"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
