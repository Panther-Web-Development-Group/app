"use client"

import { type FC, useState } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/cn"
import type { SidebarSearchbarProps } from "./types"

export const SidebarSearchbar: FC<SidebarSearchbarProps> = ({
  placeholder = "Search...",
  onSearch,
  className,
  ...props
}) => {
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(query)
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-foreground/70" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-lg border border-(--pw-border) bg-background/15 px-10 py-2 text-sm text-secondary-foreground",
            "placeholder:text-secondary-foreground/60",
            "focus:outline-none focus:ring-2 focus:ring-accent/30",
            className
          )}
          {...props}
        />
      </div>
    </form>
  )
}
