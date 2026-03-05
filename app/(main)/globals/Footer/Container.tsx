"use client"

import { FC } from "react"
import type { FooterContainerProps } from "./types"
import { cn } from "@/lib/cn"

export const FooterContainer: FC<FooterContainerProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
    >
      {children}
    </div>
  )
}
