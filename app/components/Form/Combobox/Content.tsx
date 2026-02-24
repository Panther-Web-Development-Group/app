"use client"
import { useEffect, useRef, type FC } from "react"
import { createPortal } from "react-dom"
import type { ComboboxContentProps } from "./types"
import { cn } from "@/lib/cn"
import { useComboboxContext } from "./Context"

const VIEWPORT_PAD = 8
const GAP = 4

export const ComboboxContent: FC<ComboboxContentProps> = ({
  className,
  children,
  position = "auto",
  maxHeight = "16rem",
  ...props
}) => {
  const { open, listboxId, inputId, activeValue, getOptionElement } = useComboboxContext()
  const contentRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Position calculation - use fixed positioning so dropdown escapes overflow containers (e.g. RTE toolbar)
  useEffect(() => {
    if (!open || !contentRef.current) return

    const content = contentRef.current
    const input = document.getElementById(inputId)
    if (!input) return

    const inputRect = input.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const contentHeight = content.offsetHeight
    const spaceBelow = viewportHeight - VIEWPORT_PAD - inputRect.bottom
    const spaceAbove = inputRect.top - VIEWPORT_PAD
    const showAbove =
      position === "top" || (position === "auto" && spaceBelow < contentHeight && spaceAbove > spaceBelow)

    content.style.position = "fixed"
    content.style.width = `${inputRect.width}px`
    content.style.minWidth = ""
    content.style.maxWidth = `${viewportWidth - 2 * VIEWPORT_PAD}px`
    content.style.top = ""
    content.style.bottom = ""
    content.style.left = ""
    content.style.right = ""
    content.style.transform = ""

    if (showAbove) {
      content.style.bottom = `${viewportHeight - inputRect.top + GAP}px`
      content.style.top = "auto"
    } else {
      content.style.top = `${inputRect.bottom + GAP}px`
      content.style.bottom = "auto"
    }

    let left = inputRect.left
    if (left + inputRect.width > viewportWidth - VIEWPORT_PAD) {
      left = viewportWidth - inputRect.width - VIEWPORT_PAD
    }
    left = Math.max(VIEWPORT_PAD, left)
    content.style.left = `${left}px`
  }, [open, inputId, position])

  // Scroll active option into view
  useEffect(() => {
    if (!open || !activeValue || !scrollContainerRef.current || !getOptionElement) return

    const optionElement = getOptionElement(activeValue)
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
  }, [open, activeValue, getOptionElement])

  if (!open) return null

  const maxHeightValue = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight

  const contentEl = (
    <div
      {...props}
      ref={contentRef}
      id={listboxId}
      role="listbox"
      aria-labelledby={inputId}
      className={cn(
        "z-9999 overflow-hidden rounded-lg border border-(--pw-border) bg-background shadow-lg",
        "transition-all duration-200 ease-out",
        open
          ? "pointer-events-auto opacity-100 scale-100"
          : "pointer-events-none opacity-0 scale-95",
        className
      )}
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

  if (typeof document === "undefined") return null
  return createPortal(contentEl, document.body)
}
