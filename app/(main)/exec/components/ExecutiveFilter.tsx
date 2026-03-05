"use client"

import { FC } from "react"
import { cn } from "@/lib/cn"
import { useExec } from "./Context"

export type ExecutiveFilterProps = {
  className?: string
}

export const ExecutiveFilter: FC<ExecutiveFilterProps> = ({ className }) => {
  const { activeYear, setActiveYear, executiveYears } = useExec()

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        className
      )}
      role="tablist"
      aria-label="Filter executives by year"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeYear === null}
        onClick={() => setActiveYear(null)}
        className={cn(
          "rounded-md px-4 py-2 text-sm font-medium transition-colors",
          activeYear === null
            ? "bg-accent text-accent-foreground"
            : "bg-foreground/10 text-foreground/80 hover:bg-foreground/15 hover:text-foreground"
        )}
      >
        All
      </button>
      {executiveYears.map((year) => (
        <button
          key={year}
          type="button"
          role="tab"
          aria-selected={activeYear === year}
          onClick={() => setActiveYear(year)}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeYear === year
              ? "bg-accent text-accent-foreground"
              : "bg-foreground/10 text-foreground/80 hover:bg-foreground/15 hover:text-foreground"
          )}
        >
          {year}
        </button>
      ))}
    </div>
  )
}
