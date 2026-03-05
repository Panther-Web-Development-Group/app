"use client"

import { FC, useEffect } from "react"
import { HeroProvider } from "./Context"
import { HeroContainer } from "./Container"
import { HeroBar } from "./Bar"
import { HeroControls } from "./Controls"
import { HeroIndicators } from "./Indicators"
import { HeroContent } from "./Content"
import { HeroSlide } from "./Slide"
import type { HeroProps } from "./types"
import { cn } from "@/lib/cn"
import { heroVariants } from "./variants"
import { useContainer } from "../Container/Context"

const HeroRoot: FC<HeroProps> = ({
  children,
  className,
  defaultIndex = 0,
  autoPlay = 5000,
  type = "full",
  ...props
}) => {
  const { setHasHero, heroRef } = useContainer()
  const { root } = heroVariants({ type })

  useEffect(() => {
    setHasHero(true)
    return () => setHasHero(false)
  }, [setHasHero])

  return (
    <HeroProvider defaultIndex={defaultIndex} autoPlay={autoPlay} type={type}>
      <section
        {...props}
        ref={heroRef}
        className={cn(root(), className)}
      >
        {children}
      </section>
    </HeroProvider>
  )
}

export const Hero = Object.assign(HeroRoot, {
  Container: HeroContainer,
  Bar: HeroBar,
  Controls: HeroControls,
  Indicators: HeroIndicators,
  Content: HeroContent,
  Slide: HeroSlide,
})
