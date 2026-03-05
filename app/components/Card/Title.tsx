"use client"

import { FC } from "react"
import type { CardTitleProps } from "./types"
import { cardSlotVariants } from "./variants"
import { cn } from "@/lib/cn"

export const CardTitle: FC<CardTitleProps> = ({
  as: Component = "h3",
  children,
  className,
  ...props
}) => {
  const { title } = cardSlotVariants()
  return (
    <Component {...props} className={cn(title(), className)}>
      {children}
    </Component>
  )
}
