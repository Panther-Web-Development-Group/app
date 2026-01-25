"use client"
import { useMemo, useCallback, type FC } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/cn"
import type { NavigationItem } from "../types"
import { ChevronRight } from "lucide-react"
import { usePageContext } from "@/app/globals/Page/Context"

type NavItemProps = {
  item: NavigationItem
  level?: number
}

function isActiveHref(pathname: string | null, href: string | null | undefined) {
  if (!pathname || !href) return false
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

function hasActiveDescendant(pathname: string | null, item: NavigationItem): boolean {
  if (!item.children || item.children.length === 0) return false
  return item.children.some((child) => {
    if (isActiveHref(pathname, child.href)) return true
    return hasActiveDescendant(pathname, child)
  })
}

export const NavItem: FC<NavItemProps> = ({ item, level = 0 }) => {
  const pathname = usePathname()
  const { setNavIsOpen } = usePageContext()

  const hasChildren = item.children && item.children.length > 0
  const isParent = hasChildren && !item.href

  const isActive = useMemo(() => isActiveHref(pathname, item.href), [pathname, item.href])
  const isChildActive = useMemo(
    () => (hasChildren ? hasActiveDescendant(pathname, item) : false),
    [hasChildren, pathname, item]
  )
  const isParentActive = isParent && isChildActive

  // Base matches Tailwind `px-3` (0.75rem). Each submenu level indents another 0.75rem.
  const paddingLeft = `${0.75 * (level + 1)}rem`

  const closeSidebarOnMobileNavigate = useCallback(() => {
    // Keep the "hidden behavior" on desktop (don’t collapse automatically there),
    // but close the off-canvas sidebar on mobile like the admin dashboard.
    if (typeof window === "undefined") return
    if (window.matchMedia("(min-width: 768px)").matches) return
    setNavIsOpen(false)
  }, [setNavIsOpen])

  return (
    <li>
      {isParent ? (
        <div
          className={cn(
            "flex w-full items-center gap-3 rounded-lg pr-3 py-2 text-sm font-medium",
            "transition-colors",
            isParentActive
              ? "bg-accent/20 text-secondary-foreground"
              : "text-secondary-foreground/85 hover:bg-accent/15 hover:text-secondary-foreground"
          )}
          style={{ paddingLeft }}
        >
          {item.icon && (
            <span className="flex h-5 w-5 items-center justify-center shrink-0">
              {item.icon}
            </span>
          )}
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform shrink-0",
              hasChildren && "rotate-90"
            )}
          />
        </div>
      ) : (
        <Link
          href={item.href || "#"}
          target={item.is_external ? "_blank" : item.target}
          rel={item.is_external ? "noopener noreferrer" : undefined}
          onClick={closeSidebarOnMobileNavigate}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg pr-3 py-2 text-sm font-medium",
            "transition-colors",
            isActive
              ? "bg-accent/20 text-secondary-foreground"
              : "text-secondary-foreground/85 hover:bg-accent/15 hover:text-secondary-foreground"
          )}
          style={{ paddingLeft }}
        >
          {item.icon && (
            <span className="flex h-5 w-5 items-center justify-center shrink-0">
              {item.icon}
            </span>
          )}
          <span>{item.label}</span>
        </Link>
      )}

      {hasChildren && (
        <ul className="mt-1 ml-3 border-l border-(--pw-border) pl-3">
          {item.children!.map((child) => (
            <NavItem key={child.id} item={child} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}
