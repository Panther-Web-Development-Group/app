"use client"

import { FC } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useHero } from "./Context"
import { cn } from "@/lib/cn"

type HeroControlsProps = {
  className?: string
}

const buttonStyles =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"

export const HeroControls: FC<HeroControlsProps> = ({ className }) => {
  const { goPrev, goNext, totalSlides } = useHero()

  if (totalSlides <= 1) return null

  return (
    <div className={cn("flex items-center gap-2", className)} aria-hidden>
      <button
        type="button"
        onClick={goPrev}
        className={buttonStyles}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={goNext}
        className={buttonStyles}
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
