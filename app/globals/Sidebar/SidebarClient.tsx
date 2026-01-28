"use client"

import { type FC, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { SidebarLogo } from "./Logo"
import { SidebarSearchbar } from "./Searchbar"
import { cn } from "@/lib/cn"
import type { SidebarProps } from "./types"
import { usePageContext } from "../Page/Context"
import { Button } from "@/app/components/Button"

export const SidebarClient: FC<SidebarProps> = ({
  logo,
  searchbar,
  navigation,
  className,
  ...props
}) => {
  const { navIsOpen, setNavIsOpen } = usePageContext()
  const asideRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!navIsOpen) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return

      // Don't immediately close if the click was on the toggle button.
      if (target.closest("[data-sidebar-toggle]")) return

      const aside = asideRef.current
      if (!aside) return

      // Close when clicking outside the sidebar element.
      if (!aside.contains(target)) setNavIsOpen(false)
    }

    document.addEventListener("pointerdown", onPointerDown, true)
    return () => document.removeEventListener("pointerdown", onPointerDown, true)
  }, [navIsOpen, setNavIsOpen])

  return (
    <div className={cn(
      // Wrap the sidebar in a container
      navIsOpen ? "md:w-72 md:p-4" : "md:w-0 md:p-0",
      // Add a transition effect for the width and padding
      "md:shrink-0 transition-[width,padding] duration-300 ease-in-out",
    )}>
      {/* Mobile Overlay */}
      {navIsOpen && (
        <div
          // Above header, below sidebar
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setNavIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={asideRef}
        className={cn(
          // positioning
          // Mobile: overlays header; Desktop: sits below header and sticks
          "fixed left-0 top-0 z-50 md:z-40",
          // Desktop: sit below header
          "md:top-16 md:h-[calc(100vh-4rem)]",
          // layout
          "flex h-screen flex-col gap-6 p-4",
          // theme
          "bg-background/80 text-secondary-foreground border-r border-(--pw-border) backdrop-blur-xl",
          "shadow-[0_20px_60px_var(--pw-shadow)]",
          // animate
          "transition-[transform,width,padding] duration-300 ease-in-out",
          // nicer mobile scrolling behavior
          "overscroll-contain",
          // Mobile: off-canvas slide
          navIsOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop+: collapsed by default, expands without overlaying content
          navIsOpen ? "md:w-72 md:p-4" : "md:w-0 md:p-0 md:translate-x-0 md:border-r-0",
          // keep content hidden when collapsed on desktop
          "md:overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Top row: logo + close button */}
        <div className="shrink-0 flex items-center justify-between gap-3">
          <div>{logo || <SidebarLogo />}</div>
          <Button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent/15"
            onClick={() => setNavIsOpen(false)}
            aria-label="Close navigation"
            variant="icon"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Searchbar */}
        {searchbar !== false && (
          <div className="shrink-0">
            {searchbar || <SidebarSearchbar />}
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          {navigation || (
            <nav className="flex flex-col gap-1">
              <p className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                Loading navigation…
              </p>
            </nav>
          )}
        </div>
      </aside>
    </div>
  )
}
