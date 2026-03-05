"use client"

import { FC } from "react"
import { cn } from "@/lib/cn"

export const ContactInfo: FC<{ className?: string }> = ({ className }) => {
  return (
    <address
      className={cn(
        "not-italic text-sm text-muted-foreground",
        className
      )}
    >
      <p>Georgia State University</p>
      <p>Atlanta, GA</p>
    </address>
  )
}
