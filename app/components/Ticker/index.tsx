"use client"

import { FC, useRef, useEffect } from "react"
import type { TickerProps } from "./types"
import { tickerVariants } from "./variants"
import { TickerItem } from "./Item"
import { cn } from "@/lib/cn"

const TickerRoot: FC<TickerProps> = ({
  children,
  className,
  speed = 30,
  direction = "left",
  pauseOnHover = true,
  ...props
}) => {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!trackRef.current || !pauseOnHover) return

    const track = trackRef.current
    const wrapper = track.parentElement

    const handleMouseEnter = () => {
      track.style.animationPlayState = "paused"
    }

    const handleMouseLeave = () => {
      track.style.animationPlayState = "running"
    }

    const controller = new AbortController()
    const { signal } = controller

    wrapper?.addEventListener("mouseenter", handleMouseEnter, { signal })
    wrapper?.addEventListener("mouseleave", handleMouseLeave, { signal })

    return () => controller.abort()
  }, [pauseOnHover])

  const animationName = direction === "left" ? "ticker-left" : "ticker-right"
  const trackStyle = {
    animation: `${animationName} ${speed}s linear infinite`,
  }

  return (
    <div
      {...props}
      className={cn(tickerVariants(), "py-4", className)}
      aria-hidden
    >
      <div
        ref={trackRef}
        className="flex w-full flex-shrink-0 flex-nowrap gap-8 will-change-transform"
        style={trackStyle}
      >
        <div className="flex flex-shrink-0 items-center gap-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export const Ticker = Object.assign(TickerRoot, {
  Item: TickerItem,
})

export const Marquee = Ticker
