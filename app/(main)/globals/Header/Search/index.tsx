"use client"
import {
  FC,
  PropsWithChildren
} from "react"
import { SearchProps } from "./types"
import { cn } from "@/lib/cn"
import { SearchInput } from "./Input"
import { SearchSubmit } from "./Submit"
import { SearchAutocomplete } from "./Autocomplete"

const SearchRoot: FC<PropsWithChildren<SearchProps>> = ({ className, children, overHero, ...props }) => {
  return (
    <form
      role="search"
      className={cn(
        "flex items-center gap-1",
        "w-full max-w-xs rounded-lg border transition-all duration-200",
        overHero
          ? "border-white/25 bg-white/15 backdrop-blur-md shadow-lg shadow-black/20 focus-within:border-white/40 focus-within:ring-2 focus-within:ring-white/20 focus-within:bg-white/20"
          : "border-foreground/15 bg-foreground/[0.06] focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20 focus-within:bg-foreground/[0.08]",
        className
      )}
      {...props}
    >
      {children}
    </form>
  )
}

export const Search = Object.assign(SearchRoot, {
  Input: SearchInput,
  Submit: SearchSubmit,
  Autocomplete: SearchAutocomplete,
})