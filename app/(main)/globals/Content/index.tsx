"use client"

import { FC } from "react"
import type { ContentProps } from "./types"
import { contentVariants } from "./variants"
import { cn } from "@/lib/cn"
import { ContentTitle } from "./Title"
import { ContentSubtitle } from "./Subtitle"
import { ContentDescription } from "./Description"

const ContentRoot: FC<ContentProps> = ({
  children,
  className,
  variant = "regular",
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn(contentVariants({ variant }), className)}
    >
      {children}
    </div>
  )
}

export const Content = Object.assign(ContentRoot, {
  Title: ContentTitle,
  Subtitle: ContentSubtitle,
  Description: ContentDescription,
})
