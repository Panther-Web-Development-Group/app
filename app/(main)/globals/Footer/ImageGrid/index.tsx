"use client"

import { FC, PropsWithChildren } from "react"
import { FooterImageGridItem } from "./Item"
import { cn } from "@/lib/cn"

const FooterImageGridRoot: FC<PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4",
        className
      )}
    >
      {children}
    </div>
  )
}

export const FooterImageGrid = Object.assign(FooterImageGridRoot, {
  Item: FooterImageGridItem,
})
