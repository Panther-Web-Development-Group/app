"use client"

import { FC } from "react"
import { useHero } from "../Context"
import { cn } from "@/lib/cn"

type HeroIndicatorsProps = {
  className?: string
}

export const HeroIndicators: FC<HeroIndicatorsProps> = ({ className }) => {
  const { currentIndex, totalSlides, goToSlide, pause, resume } = useHero()

  if (totalSlides <= 1) return null

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      role="tablist"
      aria-label="Slide indicators"
    >
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          type="button"
          role="tab"
          aria-selected={index === currentIndex}
          aria-label={`Go to slide ${index + 1}`}
          onClick={() => goToSlide(index)}
          onMouseEnter={pause}
          onMouseLeave={resume}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            index === currentIndex
              ? "w-8 bg-white"
              : "w-2 bg-white/50 hover:bg-white/70"
          )}
        />
      ))}
    </div>
  )
}
