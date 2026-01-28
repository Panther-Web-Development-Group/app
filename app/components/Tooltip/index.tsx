"use client"

import { useId, useMemo, useState, type FC, type ReactNode } from "react"
import { cn } from "@/lib/cn"

type TooltipSide = "top" | "bottom" | "left" | "right"

export type TooltipProps = {
  content: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  side?: TooltipSide
}

export const Tooltip: FC<TooltipProps> = ({
  content,
  children,
  className,
  contentClassName,
  side = "top",
}) => {
  const id = useId()
  const [open, setOpen] = useState(false)

  const position = useMemo(() => {
    if (side === "bottom") {
      return "top-full left-1/2 -translate-x-1/2 mt-2"
    }
    if (side === "left") {
      return "right-full top-1/2 -translate-y-1/2 mr-2"
    }
    if (side === "right") {
      return "left-full top-1/2 -translate-y-1/2 ml-2"
    }
    // top
    return "bottom-full left-1/2 -translate-x-1/2 mb-2"
  }, [side])

  if (!content) return <>{children}</>

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open ? (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 w-max max-w-xs rounded-lg border border-(--pw-border) bg-background/90 px-3 py-2 text-xs leading-5 text-foreground shadow-lg backdrop-blur",
            position,
            contentClassName,
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  )
}

