"use client"
import { useCallback, useEffect, useMemo, useRef, type FC } from "react"
import { cn } from "@/lib/cn"
import type { SelectTriggerProps } from "./types"
import { useSelectContext } from "./Context"
import { ChevronDown } from "lucide-react"

function isStringLike(node: React.ReactNode): node is string | number {
  return typeof node === "string" || typeof node === "number"
}

export const SelectTrigger: FC<SelectTriggerProps> = ({
  className,
  children,
  disabled: disabledProp,
  onClick,
  onKeyDown,
  ...buttonProps
}) => {
  const {
    disabled: disabledCtx,
    multiple,
    showMultiple,
    placeholder,
    open,
    setOpen,
    value,
    getOptionLabel,
    getAllOptionValues,
    triggerId,
    listboxId,
    focusedValue,
    setFocusedValue,
    getOptionElement,
    labelsVersion,
  } = useSelectContext()

  const disabled = disabledCtx || disabledProp
  const typeAheadRef = useRef<string>("")
  const typeAheadTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const display = useMemo(() => {
    if (children) return children

    if (multiple) {
      const arr = Array.isArray(value) ? value : []
      if (arr.length === 0) return placeholder ?? <span className="text-foreground/50">Select…</span>

      const labels = arr
        .map((v) => getOptionLabel(v))
        .filter((l): l is React.ReactNode => l !== undefined)

      if (showMultiple === "expanded") {
        // If everything is string-like, join; otherwise just render the labels inline.
        const allStringy = labels.every(isStringLike)
        return allStringy ? labels.join(", ") : <span className="inline-flex flex-wrap gap-1">{labels}</span>
      }

      // collapsed / overflow / always -> simple "first +N"
      const first = labels[0] ?? arr[0]
      const extra = arr.length - 1
      return (
        <span className="inline-flex items-center gap-2">
          <span className="truncate">{first}</span>
          {extra > 0 ? <span className="text-xs text-foreground/60">+{extra}</span> : null}
        </span>
      )
    }

    const v = typeof value === "string" ? value : undefined
    if (!v) return placeholder ?? <span className="text-foreground/50">Select…</span>
    return getOptionLabel(v) ?? v
  }, [children, getOptionLabel, multiple, placeholder, showMultiple, value, labelsVersion])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return
      setOpen(!open)
      onClick?.(e)
    },
    [disabled, onClick, open, setOpen]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return

      switch (e.key) {
        case "ArrowDown":
        case "ArrowUp":
          e.preventDefault()
          if (!open) {
            setOpen(true)
          } else {
            // Navigate options
            const options = getAllOptionValues()
            if (options.length === 0) break

            const currentIndex = focusedValue ? options.indexOf(focusedValue) : -1
            let nextIndex: number

            if (e.key === "ArrowDown") {
              nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0
            } else {
              nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1
            }

            const nextValue = options[nextIndex]
            if (nextValue) {
              setFocusedValue(nextValue)
              const nextElement = getOptionElement(nextValue)
              nextElement?.focus()
            }
          }
          break
        case "Enter":
        case " ":
          e.preventDefault()
          if (!open) {
            setOpen(true)
          } else if (focusedValue) {
            // Select focused option
            const focusedElement = getOptionElement(focusedValue)
            focusedElement?.click()
          }
          break
        case "Escape":
          e.preventDefault()
          setOpen(false)
          setFocusedValue(null)
          break
        case "Home":
        case "End":
          if (open) {
            e.preventDefault()
            const options = getAllOptionValues()
            if (options.length === 0) break

            const targetValue = e.key === "Home" ? options[0] : options[options.length - 1]
            if (targetValue) {
              setFocusedValue(targetValue)
              const targetElement = getOptionElement(targetValue)
              targetElement?.focus()
            }
          }
          break
        default:
          // Type-ahead search
          if (open && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault()
            const char = e.key.toLowerCase()
            typeAheadRef.current += char

            // Clear timeout
            if (typeAheadTimeoutRef.current) {
              clearTimeout(typeAheadTimeoutRef.current)
            }

            // Find matching option
            const options = getAllOptionValues()
            const searchText = typeAheadRef.current
            const match = options.find((opt) => {
              const label = getOptionLabel(opt)
              const text = typeof label === "string" ? label : 
                          typeof label === "number" ? String(label) :
                          label ? String(label) : opt
              return text.toLowerCase().startsWith(searchText)
            })

            if (match) {
              setFocusedValue(match)
              const matchElement = getOptionElement(match)
              matchElement?.focus()
            }

            // Clear type-ahead after 1 second
            typeAheadTimeoutRef.current = setTimeout(() => {
              typeAheadRef.current = ""
            }, 1000)
          }
          break
      }
      onKeyDown?.(e)
    },
    [disabled, open, getAllOptionValues, focusedValue, setFocusedValue, getOptionElement, getOptionLabel, onKeyDown, setOpen]
  )

  // Cleanup type-ahead timeout
  useEffect(() => {
    return () => {
      if (typeAheadTimeoutRef.current) {
        clearTimeout(typeAheadTimeoutRef.current)
      }
    }
  }, [])

  // Reset type-ahead when closing
  useEffect(() => {
    if (!open) {
      typeAheadRef.current = ""
      if (typeAheadTimeoutRef.current) {
        clearTimeout(typeAheadTimeoutRef.current)
      }
    }
  }, [open])

  return (
    <button
      {...buttonProps}
      id={triggerId}
      type="button"
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listboxId}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none",
        "transition-all duration-200",
        "focus-visible:ring-2 focus-visible:ring-(--pw-ring) focus-visible:ring-offset-2",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:bg-background/15 hover:border-(--pw-border)/80 active:bg-background/20",
        open && "border-(--pw-border)/80",
        className
      )}
    >
      <span className="min-w-0 flex-1 truncate text-left">{display}</span>
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-foreground/70 transition-transform duration-200",
          open && "rotate-180"
        )}
      />
    </button>
  )
}
