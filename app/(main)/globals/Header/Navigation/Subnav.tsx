"use client"
import {
  FC
} from "react"
import { NavigationSubnavProps } from "./types"
import { cn } from "@/lib/cn"

export const NavigationSubnav: FC<NavigationSubnavProps> = ({ className, children, isOpen: _isOpen, ...props }) => {
  return (
    <div
      {...props}
      role="menu"
      className={cn(
        "ml-4 mt-1 flex flex-col gap-0.5 border-l border-foreground/20 pl-4",
        "[&_a]:py-2 [&_a]:text-foreground/70 [&_a]:text-xs [&_a:hover]:text-foreground",
        className
      )}
    >
      {children}
    </div>
  )
}