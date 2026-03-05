"use client"
import {
  FC
} from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NavigationLinkProps } from "./types"
import { cn } from "@/lib/cn"

export const NavigationLink: FC<NavigationLinkProps> = ({ className, children, href, onClick, ...props }) => {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))

  return (
    <Link
      {...props}
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "block rounded-lg py-2.5 pl-4 pr-3 text-sm font-medium transition-colors",
        "text-foreground/90 hover:bg-foreground/5 hover:text-foreground",
        "border-l-2",
        isActive
          ? "border-accent bg-accent/10 text-accent"
          : "border-transparent",
        className
      )}
    >
      {children}
    </Link>
  )
}