"use client"
import { useEffect, useRef, type FC } from "react"
import type { SelectContentProps } from "./types"
import { cn } from "@/lib/cn"
import { useSelectContext } from "./Context"

export const SelectContent: FC<SelectContentProps> = ({
  className,
  children,
  position = "auto",
  maxHeight = "16rem",
  ...props
}) => {
  const { open, listboxId, triggerId, focusedValue, getOptionElement } = useSelectContext()
  const contentRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Position calculation
  useEffect(() => {
    if (!open || !contentRef.current) return

    const content = contentRef.current
    const trigger = document.getElementById(triggerId)
    if (!trigger) return

    const triggerRect = trigger.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const contentHeight = content.offsetHeight
    const spaceBelow = viewportHeight - triggerRect.bottom
    const spaceAbove = triggerRect.top

    // Reset positioning
    content.style.top = ""
    content.style.bottom = ""
    content.style.left = ""
    content.style.right = ""
    content.style.transform = ""

    // Horizontal positioning - ensure it stays within viewport
    if (triggerRect.left + triggerRect.width > viewportWidth - 20) {
      content.style.right = "0"
    } else {
      content.style.left = "0"
    }

    // Vertical positioning
    if (position === "top" || (position === "auto" && spaceBelow < contentHeight && spaceAbove > spaceBelow)) {
      // Position above
      content.style.bottom = "100%"
      content.style.marginBottom = "0.25rem"
      content.style.marginTop = ""
    } else {
      // Position below (default)
      content.style.top = "100%"
      content.style.marginTop = "0.25rem"
      content.style.marginBottom = ""
    }
  }, [open, triggerId, position])

  // Scroll focused option into view
  useEffect(() => {
    if (!open || !focusedValue || !scrollContainerRef.current) return

    const optionElement = getOptionElement(focusedValue)
    if (!optionElement) return

    const container = scrollContainerRef.current
    const optionRect = optionElement.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    // Check if option is outside visible area
    if (optionRect.top < containerRect.top) {
      optionElement.scrollIntoView({ block: "nearest", behavior: "smooth" })
    } else if (optionRect.bottom > containerRect.bottom) {
      optionElement.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }
  }, [open, focusedValue, getOptionElement])

  const maxHeightValue = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight

  return (
    <div
      {...props}
      ref={contentRef}
      id={listboxId}
      role="listbox"
      aria-labelledby={triggerId}
      className={cn(
        "absolute z-50 w-full overflow-hidden rounded-lg border border-(--pw-border) bg-background shadow-lg",
        "transition-all duration-200 ease-out",
        open
          ? "pointer-events-auto opacity-100 scale-100"
          : "pointer-events-none opacity-0 scale-95",
        className
      )}
      aria-hidden={!open}
      style={{ maxHeight: maxHeightValue }}
    >
      <div
        ref={scrollContainerRef}
        className="overflow-auto p-1"
        style={{ maxHeight: maxHeightValue }}
      >
        {children}
      </div>
    </div>
  )
}
