import type { HTMLAttributes } from "react"
import type { ClassValue } from "clsx"

export type ScrollProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  className?: ClassValue

  /** Position of the bar (default "top") */
  position?: "top" | "bottom"
  /** Height of the bar in pixels (default 3) */
  height?: number
  /** Optional aria-label for the progress bar */
  "aria-label"?: string
}
