"use client"

import { useEffect, useState, type FC } from "react"
import type { ScrollProgressProps } from "./types"
import { cn } from "@/lib/cn"

function getScrollProgress(): number {
  if (typeof window === "undefined") return 0
  const { scrollY, innerHeight } = window
  const { scrollHeight } = document.documentElement
  const maxScroll = Math.max(0, scrollHeight - innerHeight)
  if (maxScroll <= 0) return 0
  return Math.min(1, Math.max(0, scrollY / maxScroll))
}

export const ScrollProgress: FC<ScrollProgressProps> = ({
  className,
  position = "top",
  height = 3,
  "aria-label": ariaLabel = "Scroll progress",
  id,
  ...divProps
}) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => setProgress(getScrollProgress())
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update, { passive: true })
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  const isTop = position === "top"

  return (
    <div
      {...divProps}
      id={id}
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={cn(
        "fixed left-0 right-0 z-50 w-full overflow-hidden",
        isTop ? "top-0" : "bottom-0",
        className
      )}
      style={{ height: `${height}px` }}
    >
      <div
        className="h-full bg-accent transition-[width] duration-150 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  )
}
