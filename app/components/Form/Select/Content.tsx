"use client"
import { useEffect, useRef, type FC } from "react"
import { createPortal } from "react-dom"
import type { SelectContentProps } from "./types"
import { cn } from "@/lib/cn"
import { useSelectContext } from "./Context"

const VIEWPORT_PAD = 8
const GAP = 4

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

  // Position calculation - use fixed positioning so dropdown escapes overflow containers (e.g. RTE toolbar)
  useEffect(() => {
    if (!open || !contentRef.current) return

    const content = contentRef.current
    const trigger = document.getElementById(triggerId)
    if (!trigger) return

    const triggerRect = trigger.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const contentHeight = content.offsetHeight
    const spaceBelow = viewportHeight - VIEWPORT_PAD - triggerRect.bottom
    const spaceAbove = triggerRect.top - VIEWPORT_PAD
    const showAbove =
      position === "top" || (position === "auto" && spaceBelow < contentHeight && spaceAbove > spaceBelow)

    content.style.position = "fixed"
    content.style.width = `${triggerRect.width}px`
    content.style.minWidth = ""
    content.style.maxWidth = `${viewportWidth - 2 * VIEWPORT_PAD}px`
    content.style.top = ""
    content.style.bottom = ""
    content.style.left = ""
    content.style.right = ""
    content.style.transform = ""

    if (showAbove) {
      content.style.bottom = `${viewportHeight - triggerRect.top + GAP}px`
      content.style.top = "auto"
    } else {
      content.style.top = `${triggerRect.bottom + GAP}px`
      content.style.bottom = "auto"
    }

    let left = triggerRect.left
    if (left + triggerRect.width > viewportWidth - VIEWPORT_PAD) {
      left = viewportWidth - triggerRect.width - VIEWPORT_PAD
    }
    left = Math.max(VIEWPORT_PAD, left)
    content.style.left = `${left}px`
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

  if (!open) return null

  const maxHeightValue = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight

  const contentEl = (
    <div
      {...props}
      ref={contentRef}
      className={cn(
        "z-9999 overflow-hidden rounded-lg border border-(--pw-border) bg-background shadow-lg",
        "transition-all duration-200 ease-out",
        "pointer-events-auto opacity-100 scale-100",
        className
      )}
      aria-hidden={false}
      style={{ maxHeight: maxHeightValue }}
    >
      <div
        ref={scrollContainerRef}
        className="overflow-auto p-1"
        style={{ maxHeight: maxHeightValue }}
      >
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={triggerId}
          className="flex list-none flex-col gap-0.5 p-0 m-0"
        >
          {children}
        </ul>
      </div>
    </div>
  )

  if (typeof document === "undefined") return null
  return createPortal(contentEl, document.body)
}
