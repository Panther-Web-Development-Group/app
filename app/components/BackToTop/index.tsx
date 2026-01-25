"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/cn"
import { Button } from "@/app/components/Button"

export function BackToTop({ className }: { className?: string }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 240)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <Button
      type="button"
      aria-label="Back to top"
      className={cn(
        // Use the shared Button component, but force this to be a circular icon button.
        "fixed bottom-6 right-6 z-50 !h-11 !w-11 !rounded-full !p-0 border border-(--pw-border) bg-secondary text-secondary-foreground/80 shadow-sm transition-colors hover:bg-accent/15 hover:text-secondary-foreground",
        isVisible ? "opacity-100" : "pointer-events-none opacity-0",
        className
      )}
      variant="ghost"
      icon={<ArrowUp className="h-5 w-5" />}
      onClick={() => {
        if (typeof window === "undefined") return
        const prefersReducedMotion =
          window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })
      }}
    >
      <span className="sr-only">Back to top</span>
    </Button>
  )
}

