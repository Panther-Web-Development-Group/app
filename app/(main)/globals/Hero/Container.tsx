"use client"

import { FC, useEffect, Children } from "react"
import { useHeroConfig } from "./Context"
import { useHero } from "./Context"
import { heroVariants } from "./variants"
import { cn } from "@/lib/cn"

type HeroContainerProps = {
  children: React.ReactNode
  className?: string
}

export const HeroContainer: FC<HeroContainerProps> = ({
  children,
  className,
}) => {
  const setTotalSlides = useHeroConfig()?.setTotalSlides
  const { currentIndex } = useHero()
  const { container, track, slideWrapper } = heroVariants()

  useEffect(() => {
    setTotalSlides?.(Children.count(children))
  }, [children, setTotalSlides])

  const slideCount = Math.max(1, Children.count(children))

  return (
    <div
      className={cn(container(), className)}
      role="region"
      aria-label="Hero carousel"
      aria-roledescription="carousel"
    >
      <div
        className={track()}
        style={{
          width: `${slideCount * 100}%`,
          transform: `translate3d(-${(currentIndex / slideCount) * 100}%, 0, 0)`,
        }}
      >
        {Children.map(children, (child, index) => (
          <div
            key={index}
            className={cn(slideWrapper(), "w-full")}
            style={{ width: `${100 / slideCount}%` }}
            aria-hidden={index !== currentIndex}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
