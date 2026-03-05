"use client"

import { FC } from "react"
import Link from "next/link"
import type { FooterNavItemProps } from "../types"
import { cn } from "@/lib/cn"

export const FooterNavItem: FC<FooterNavItemProps> = ({
  href,
  children,
  className,
  ...props
}) => {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "text-sm text-foreground/90 transition-colors hover:text-accent",
          className
        )}
        {...props}
      >
        {children}
      </Link>
    </li>
  )
}
