"use client"

import { FC } from "react"
import { useHeroConfig } from "../Context"
import type { HeroSlideProps } from "./types"
import { HeroSlideImage } from "./Image"
import { HeroSlideContent } from "./Content"
import { heroVariants } from "../variants"
import { cn } from "@/lib/cn"

const HeroSlideRoot: FC<HeroSlideProps> = ({ children, className, ...props }) => {
  const type = useHeroConfig()?.type ?? "full"
  const { slide } = heroVariants({ type })

  return (
    <div
      {...props}
      className={cn(slide(), className)}
      role="group"
      aria-roledescription="slide"
    >
      {children}
    </div>
  )
}

export const HeroSlide = Object.assign(HeroSlideRoot, {
  Image: HeroSlideImage,
  Content: HeroSlideContent,
})
