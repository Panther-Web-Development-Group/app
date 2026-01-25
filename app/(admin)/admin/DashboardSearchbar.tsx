"use client"

import { useState } from "react"
import { Search } from "lucide-react"

export function DashboardSearchbar() {
  const [value, setValue] = useState("")

  return (
    <form onSubmit={(e) => e.preventDefault()} aria-label="Dashboard search">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/70" />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search…"
          className="h-10 w-64 rounded-lg border border-(--pw-border) bg-background/10 pl-10 pr-3 text-sm text-foreground placeholder:text-foreground/60 outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>
    </form>
  )
}

