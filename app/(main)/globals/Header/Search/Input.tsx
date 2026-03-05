"use client"
import { forwardRef } from "react"
import { SearchInputProps } from "./types"
import { cn } from "@/lib/cn"

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="search"
        autoComplete="off"
        enterKeyHint="search"
        className={cn(
          "flex-1 min-w-0 py-2.5 pl-3 pr-1 text-sm",
          "bg-transparent text-foreground placeholder:text-foreground/45",
          "border-0 outline-none focus:ring-0 focus:outline-none",
          className
        )}
        {...props}
      />
    )
  }
)
SearchInput.displayName = "SearchInput"