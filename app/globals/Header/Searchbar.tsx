"use client"

import { useState, type FC } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/cn"

type HeaderSearchbarProps = {
  placeholder?: string
  className?: string
}

export const HeaderSearchbar: FC<HeaderSearchbarProps> = ({
  placeholder = "Search…",
  className,
}) => {
  const [query, setQuery] = useState("")

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className={cn("group relative", className)}
      aria-label="Search"
    >
      <div
        className={cn(
          "relative flex items-center",
          "h-10 overflow-hidden rounded-lg border border-(--pw-border)",
          "bg-background/20 backdrop-blur-sm",
          // collapsed by default, expands on focus
          "w-10 focus-within:w-64",
          "transition-[width] duration-200 ease-out"
        )}
      >
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-foreground/70" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-full w-full bg-transparent pl-10 pr-3 text-sm text-foreground",
            "placeholder:text-foreground/60",
            "outline-none"
          )}
        />
      </div>
    </form>
  )
}

