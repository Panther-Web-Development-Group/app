"use client"
import {
  FC,
  useEffect
} from "react"
import { NavigationContentProps } from "./types"
import { cn } from "@/lib/cn"
import { useContainer } from "../../Container/Context"

export const NavigationContent: FC<NavigationContentProps> = ({ className, children, search, brand, ...props }) => {
  const { navIsOpen, setNavIsOpen } = useContainer()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavIsOpen(false)
    }
    if (navIsOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [navIsOpen, setNavIsOpen])

  return (
    <div
      {...props}
      role="navigation"
      aria-label="Main navigation"
      aria-hidden={!navIsOpen}
      id="navigation-content"
      className={cn(
        "fixed top-0 left-0 z-[9999] w-full md:w-[320px] max-w-full h-dvh",
        "flex flex-col bg-header-background text-foreground shadow-2xl",
        "border-r border-foreground/10 shadow-xl",
        "transition-[transform,height] duration-300 ease-out",
        navIsOpen
          ? "h-dvh visible"
          : "invisible translate-y-full pointer-events-none h-0 overflow-hidden",
        className
      )}
    >
      <div className="flex flex-1 flex-col overflow-y-auto px-5 py-6 md:px-8">
        {brand && (
          <div className="mb-6 shrink-0">
            {brand}
          </div>
        )}
        {search && (
          <div className="mb-6 md:hidden">
            {search}
          </div>
        )}
        <nav className="flex flex-col gap-1">
          {children}
        </nav>
      </div>
    </div>
  )
}