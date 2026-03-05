"use client"

import { FC } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useHero } from "./Context"
import { HeroIndicators } from "./Indicators"
import { heroVariants } from "./variants"
import { cn } from "@/lib/cn"

type HeroBarProps = {
  className?: string
}

const buttonStyles =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"

export const HeroBar: FC<HeroBarProps> = ({ className }) => {
  const { goPrev, goNext, totalSlides } = useHero()
  const { bar } = heroVariants()

  if (totalSlides <= 1) return null

  return (
    <>
      <div
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2"
        aria-hidden
      >
        <button
          type="button"
          onClick={goPrev}
          className={buttonStyles}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
      <div
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2"
        aria-hidden
      >
        <button
          type="button"
          onClick={goNext}
          className={buttonStyles}
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div
        className={cn(bar(), "bg-gradient-to-t from-black/40 to-transparent", className)}
        aria-hidden
      >
        <HeroIndicators />
      </div>
    </>
  )
}
