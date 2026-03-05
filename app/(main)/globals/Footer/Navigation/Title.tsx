"use client"

import { FC } from "react"
import { cn } from "@/lib/cn"

export const FooterNavTitle: FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  return (
    <h3
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
        className
      )}
    >
      {children}
    </h3>
  )
}
