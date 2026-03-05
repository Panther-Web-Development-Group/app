"use client"

import { FC } from "react"
import { cn } from "@/lib/cn"
import type { SearchAutocompleteSectionProps } from "../types"

export const SearchAutocompleteSection: FC<SearchAutocompleteSectionProps> = ({
  className,
  title,
  children,
  ...props
}) => {
  return (
    <div className={cn("shrink-0", className)} {...props}>
      {title && (
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground/50">
          {title}
        </div>
      )}
      <ul role="group" aria-label={typeof title === "string" ? title : undefined} className="flex flex-col gap-0.5">
        {children}
      </ul>
    </div>
  )
}
