"use client"

import { FC } from "react"
import type { CardContentProps } from "./types"
import { cardSlotVariants } from "./variants"
import { cn } from "@/lib/cn"

export const CardContent: FC<CardContentProps> = ({
  children,
  className,
  ...props
}) => {
  const { content } = cardSlotVariants()
  return (
    <div {...props} className={cn(content(), className)}>
      {children}
    </div>
  )
}
