"use client"
import {
  FC
} from "react"
import { SearchSubmitProps } from "./types"
import { cn } from "@/lib/cn"
import { SearchIcon } from "lucide-react"

export const SearchSubmit: FC<SearchSubmitProps> = ({ className, ...props }) => {
  return (
    <button
      type="submit"
      aria-label="Search"
      className={cn(
        "shrink-0 p-2 rounded-md text-foreground/60 hover:text-accent hover:bg-accent/10",
        "transition-colors duration-200",
        className
      )}
      {...props}
    >
      <SearchIcon className="w-4 h-4" />
    </button>
  )
}