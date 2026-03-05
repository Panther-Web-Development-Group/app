"use client"

import { FC } from "react"
import type { HeroSlideContentProps } from "./types"
import { cn } from "@/lib/cn"

export const HeroSlideContent: FC<HeroSlideContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn(
        "absolute inset-0 z-[2] flex flex-col items-center justify-center px-6 py-12",
        "bg-gradient-to-t from-black/50 via-black/20 to-transparent",
        "text-white",
        className
      )}
    >
      {children}
    </div>
  )
}
