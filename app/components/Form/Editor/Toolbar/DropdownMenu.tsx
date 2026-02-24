"use client"

import { useCallback, useEffect, useId, useRef, useState, type FC, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/app/components/Button"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/cn"

export type DropdownSeparatorItem = { separator: true }

export type DropdownMenuItemRoot = {
  label: string
  icon?: ReactNode
  onClick: () => void
  disabled?: boolean
  separator?: boolean
}

export type DropdownMenuItem =
  DropdownSeparatorItem |
  DropdownMenuItemRoot

interface DropdownMenuProps {
  trigger: ReactNode
  items?: DropdownMenuItem[]
  children?: ReactNode
  align?: "left" | "right" | "center"
  className?: string
  triggerClassName?: string
  contentClassName?: string
  disabled?: boolean
  isActive?: boolean
  title?: string
  showChevron?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const DropdownMenu: FC<DropdownMenuProps> = ({
  trigger,
  items,
  children,
  align = "left",
  className,
  triggerClassName,
  contentClassName,
  disabled = false,
  isActive,
  title,
  showChevron = true,
  open: controlledOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const triggerId = `${menuId}-trigger`

  const handleToggle = useCallback(() => {
    if (!disabled) {
      const newOpen = !open
      if (onOpenChange) {
        onOpenChange(newOpen)
      } else {
        setInternalOpen(newOpen)
      }
    }
  }, [disabled, open, onOpenChange])

  const handleClose = useCallback(() => {
    if (onOpenChange) {
      onOpenChange(false)
    } else {
      setInternalOpen(false)
    }
  }, [onOpenChange])

  const handleItemClick = useCallback(
    (item: DropdownMenuItemRoot) => {
      if (!item.disabled) {
        item.onClick()
        handleClose()
      }
    },
    [handleClose]
  )

  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape key (menu may be in portal, so check both root and menu)
  useEffect(() => {
    if (!open) return

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target instanceof Node ? e.target : null
      if (!target) return
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      handleClose()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    const controller = new AbortController()
    const { signal } = controller

    // Small delay to prevent immediate close when opening
    const timeout = setTimeout(() => {
      document.addEventListener("mousedown", handlePointerDown, { signal })
      document.addEventListener("touchstart", handlePointerDown, { passive: true, signal })
      document.addEventListener("keydown", handleKeyDown, { signal })
    }, 0)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [open, handleClose])

  // Keyboard navigation (menu may be in portal - use menuRef)
  useEffect(() => {
    if (!open) return

    const menuElement = menuRef.current ?? document.getElementById(menuId)
    if (!menuElement) return

    const items = Array.from(menuElement.querySelectorAll('[role="menuitem"]')) as HTMLElement[]
    const enabledItems = items.filter((item) => !item.hasAttribute("aria-disabled"))

    if (enabledItems.length === 0) return

    let focusedIndex = -1

    const focusItem = (index: number) => {
      if (index >= 0 && index < enabledItems.length) {
        enabledItems[index].focus()
        focusedIndex = index
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        focusItem(focusedIndex < enabledItems.length - 1 ? focusedIndex + 1 : 0)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        focusItem(focusedIndex > 0 ? focusedIndex - 1 : enabledItems.length - 1)
      } else if (e.key === "Home") {
        e.preventDefault()
        focusItem(0)
      } else if (e.key === "End") {
        e.preventDefault()
        focusItem(enabledItems.length - 1)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  // Position with fixed + portal so menu escapes overflow containers (e.g. RTE toolbar)
  const VIEWPORT_PAD = 8
  const GAP = 6
  const MIN_SPACE_BELOW_TO_SHOW = 120
  useEffect(() => {
    if (!open || !rootRef.current || !menuRef.current) return

    const trigger = rootRef.current.querySelector(`#${triggerId}`) as HTMLElement
    if (!trigger) return

    const run = () => {
      const menu = menuRef.current
      if (!menu) return
      const triggerRect = trigger.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      const menuRect = menu.getBoundingClientRect()
      const menuWidth = menuRect.width || 256

      menu.style.position = "fixed"
      menu.style.left = ""
      menu.style.right = ""
      menu.style.top = ""
      menu.style.bottom = ""
      menu.style.transform = ""

      const spaceBelow = vh - VIEWPORT_PAD - triggerRect.bottom
      const spaceAbove = triggerRect.top - VIEWPORT_PAD
      const showAbove =
        spaceBelow < MIN_SPACE_BELOW_TO_SHOW && spaceAbove > spaceBelow

      if (showAbove) {
        menu.style.bottom = `${vh - triggerRect.top + GAP}px`
        menu.style.top = "auto"
      } else {
        menu.style.top = `${triggerRect.bottom + GAP}px`
        menu.style.bottom = "auto"
      }

      let left: number
      if (align === "right") {
        left = triggerRect.right - menuWidth
      } else if (align === "center") {
        left = triggerRect.left + (triggerRect.width - menuWidth) / 2
      } else {
        left = triggerRect.left
      }
      left = Math.max(VIEWPORT_PAD, Math.min(left, vw - menuWidth - VIEWPORT_PAD))
      menu.style.left = `${left}px`
    }

    const timeout = setTimeout(run, 0)
    return () => clearTimeout(timeout)
  }, [open, align, triggerId])

  const filteredItems = items ? items.filter((item) => item !== null) : []

  const menuContent = open ? (
    <div
      ref={menuRef}
      id={menuId}
      role={children ? "dialog" : "menu"}
      aria-labelledby={triggerId}
      className={cn(
        "z-9999 rounded-lg max-h-[min(70vh,400px)] overflow-x-hidden overflow-y-auto",
        "border border-foreground/10 dark:border-foreground/20",
        "bg-background/95 backdrop-blur-md shadow-xl",
        "ring-1 ring-foreground/5",
        children ? "w-64 p-2.5" : "min-w-[160px]",
        contentClassName
      )}
    >
      {children ? (
        children
      ) : (
        <div className="p-0.5">
          {filteredItems.map((item, index) => {
            if (item.separator) {
              return (
                <div
                  key={`separator-${index}`}
                  className="my-1 h-px bg-foreground/10 dark:bg-foreground/20"
                  role="separator"
                />
              )
            }

            return (
              <button
                key={`item-${index}`}
                type="button"
                role="menuitem"
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                aria-disabled={item.disabled}
                className={cn(
                  "w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors",
                  "hover:bg-foreground/5 dark:hover:bg-foreground/10",
                  "focus:bg-foreground/5 dark:focus:bg-foreground/10 focus:outline-none",
                  item.disabled && "opacity-40 cursor-not-allowed"
                )}
              >
                {item.icon && (
                  <span className="flex h-3.5 w-3.5 items-center justify-center text-foreground/70 shrink-0">
                    {item.icon}
                  </span>
                )}
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  ) : null

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Button
        id={triggerId}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleToggle}
        disabled={disabled}
        variant="ghost"
        aria-haspopup={children ? "dialog" : "menu"}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-pressed={isActive}
        title={title}
        className={cn(
          "h-8 w-8 p-2 rounded-md transition-all duration-150",
          "hover:bg-foreground/5 dark:hover:bg-foreground/10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-1",
          "active:scale-95",
          isActive &&
            "bg-foreground/10 dark:bg-foreground/20 text-foreground shadow-sm",
          !isActive && "text-foreground/70",
          disabled && "opacity-40 cursor-not-allowed",
          triggerClassName
        )}
      >
        {trigger}
        {showChevron && (
          <ChevronDown
            className={cn(
              "h-3 w-3 ml-1 transition-transform",
              open && "rotate-180"
            )}
            aria-hidden
          />
        )}
      </Button>

      {open && typeof document !== "undefined" && createPortal(menuContent, document.body)}
    </div>
  )
}
