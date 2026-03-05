"use client"

import { FC } from "react"
import { cn } from "@/lib/cn"

type HeroContentProps = {
  children: React.ReactNode
  className?: string
}

export const HeroContent: FC<HeroContentProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6",
        className
      )}
    >
      {children}
    </div>
  )
}
