"use client"
import { FC } from "react"
import { HeaderContainerProps } from "./types"
import { cn } from "@/lib/cn"

export const HeaderContainer: FC<HeaderContainerProps> = ({ children, className, ...props }) => {
  return (
    <div {...props} className={cn("relative", className)}>
      {children}
    </div>
  )
}