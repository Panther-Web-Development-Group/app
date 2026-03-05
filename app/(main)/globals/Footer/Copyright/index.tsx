"use client"

import { FC } from "react"
import { cn } from "@/lib/cn"

export interface CopyrightProps {
  /** Copyright holder name (e.g. "PantherWeb") */
  holder?: string
  /** Additional text after the holder (e.g. "Georgia State University") */
  additional?: string
  /** Start year for range (e.g. 2020 for "© 2020–2025") */
  startYear?: number
  className?: string
}

export const Copyright: FC<CopyrightProps> = ({
  holder = "PantherWeb",
  additional,
  startYear,
  className,
}) => {
  const currentYear = new Date().getFullYear()
  const yearRange =
    startYear && startYear < currentYear
      ? `${startYear}–${currentYear}`
      : String(currentYear)

  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      role="contentinfo"
    >
      © {yearRange} {holder}
      {additional && `. ${additional}`}
    </p>
  )
}
