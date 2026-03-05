"use client"

import { FC } from "react"
import type { TickerItemProps } from "./types"
import { cn } from "@/lib/cn"

export const TickerItem: FC<TickerItemProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn("flex shrink-0 items-center justify-center", className)}
    >
      {children}
    </div>
  )
}
