"use client"

import { FC } from "react"
import type { FooterNavSectionProps } from "../types"
import { FooterNavTitle } from "./Title"
import { FooterNavItem } from "./Item"
import { cn } from "@/lib/cn"

export const FooterNavSection: FC<FooterNavSectionProps> = ({
  title,
  children,
  className,
}) => {
  return (
    <nav className={cn("flex flex-col gap-3", className)} aria-label={title}>
      <FooterNavTitle>{title}</FooterNavTitle>
      <ul className="flex flex-col gap-2">
        {children}
      </ul>
    </nav>
  )
}
