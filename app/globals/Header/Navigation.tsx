"use client"

import { useState, type FC } from "react"
import Link from "next/link"
import { cn } from "@/lib/cn"
import type { NavigationItem } from "../Sidebar/types"
import { ChevronDown, Menu, X } from "lucide-react"
import { Button } from "@/app/components/Button"

type HeaderNavigationProps = {
  items: NavigationItem[]
  className?: string
}

export const HeaderNavigation: FC<HeaderNavigationProps> = ({
  items,
  className,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={cn("hidden md:flex items-center gap-1", className)}>
        {items.map((item) => {
          const hasChildren = item.children && item.children.length > 0

          if (hasChildren) {
            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.id)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Button
                  type="button"
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium",
                    "text-foreground transition-colors",
                    "hover:bg-accent/20"
                  )}
                  variant="ghost"
                >
                  {item.icon && (
                    <span className="flex h-4 w-4 items-center justify-center">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {openDropdown === item.id && item.children && (
                  <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border border-(--pw-border) bg-secondary shadow-lg py-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href || "#"}
                        target={child.is_external ? "_blank" : child.target}
                        rel={child.is_external ? "noopener noreferrer" : undefined}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-sm",
                          "text-secondary-foreground transition-colors",
                          "hover:bg-accent/15"
                        )}
                      >
                        {child.icon && (
                          <span className="flex h-4 w-4 items-center justify-center">
                            {child.icon}
                          </span>
                        )}
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.id}
              href={item.href || "#"}
              target={item.is_external ? "_blank" : item.target}
              rel={item.is_external ? "noopener noreferrer" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                "text-foreground transition-colors",
                "hover:bg-accent/20"
              )}
            >
              {item.icon && (
                <span className="flex h-4 w-4 items-center justify-center">
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Mobile Menu Button */}
      <Button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={cn(
          "md:hidden flex items-center justify-center h-10 w-10 rounded-lg",
          "text-foreground transition-colors",
          "hover:bg-accent/20"
        )}
        aria-label="Toggle menu"
        variant="icon"
      >
        {mobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 border-b border-(--pw-border) bg-secondary md:hidden">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {items.map((item) => {
              const hasChildren = item.children && item.children.length > 0
              const isOpen = openDropdown === item.id

              if (hasChildren) {
                return (
                  <div key={item.id}>
                    <Button
                      type="button"
                      onClick={() =>
                        setOpenDropdown(isOpen ? null : item.id)
                      }
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                        "text-secondary-foreground transition-colors",
                        "hover:bg-accent/15"
                      )}
                      variant="ghost"
                    >
                      <div className="flex items-center gap-2">
                        {item.icon && (
                          <span className="flex h-4 w-4 items-center justify-center">
                            {item.icon}
                          </span>
                        )}
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </Button>
                    {isOpen && item.children && (
                      <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-(--pw-border) pl-4">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            href={child.href || "#"}
                            target={child.is_external ? "_blank" : child.target}
                            rel={
                              child.is_external ? "noopener noreferrer" : undefined
                            }
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                              "text-secondary-foreground/85 transition-colors",
                              "hover:bg-accent/15 hover:text-secondary-foreground"
                            )}
                          >
                            {child.icon && (
                              <span className="flex h-4 w-4 items-center justify-center">
                                {child.icon}
                              </span>
                            )}
                            <span>{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={item.id}
                  href={item.href || "#"}
                  target={item.is_external ? "_blank" : item.target}
                  rel={item.is_external ? "noopener noreferrer" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                    "text-secondary-foreground transition-colors",
                    "hover:bg-accent/15"
                  )}
                >
                  {item.icon && (
                    <span className="flex h-4 w-4 items-center justify-center">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </>
  )
}
