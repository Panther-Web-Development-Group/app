"use client"

import { FC, PropsWithChildren } from "react"
import Link from "next/link"
import { FooterNavSection } from "./Section"
import { FooterNavItem } from "./Item"
import { cn } from "@/lib/cn"

const FooterNavRoot: FC<PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("flex flex-wrap gap-8 lg:gap-12", className)}>
      {children}
    </div>
  )
}

export const FooterNavigation = Object.assign(FooterNavRoot, {
  Section: FooterNavSection,
  Item: FooterNavItem,
})
