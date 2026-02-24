"use client"
import { useCallback, useMemo, useRef, useEffect, type FC } from "react"
import { ChevronDown } from "lucide-react"
import type { ComboboxInputProps } from "./types"
import { cn } from "@/lib/cn"
import { useComboboxContext } from "./Context"

const DEFAULT_TRIGGER_CLASSES =
  "inline-flex h-10 w-full items-center gap-2 rounded-lg border border-(--pw-border) bg-background/10 overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-(--pw-ring) focus-within:ring-offset-2"

export const ComboboxInput: FC<ComboboxInputProps> = ({
  className,
  triggerClassName,
  chevronClassName,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}) => {
  const {
    disabled: disabledCtx,
    open,
    setOpen,
    query,
    setQuery,
    value,
    getOptionText,
    getOptionDisabled,
    getOptionElement,
    placeholder,
    activeValue,
    setActiveValue,
    setValue,
    getVisibleValues,
    listboxId,
    inputId,
    getOptionId,
    isClickingOptionRef,
    justSelectedRef,
  } = useComboboxContext()

  const displayPlaceholder = useMemo(() => {
    if (props.placeholder !== undefined) return props.placeholder
    if (placeholder === undefined) return "Search…"
    return typeof placeholder === "string" ? placeholder : undefined
  }, [placeholder, props.placeholder])

  const ariaActiveDescendant = activeValue ? getOptionId(activeValue) : undefined

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value)
      if (!open) setOpen(true)
      props.onChange?.(e)
    },
    [open, props, setOpen, setQuery]
  )

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (justSelectedRef?.current) {
        justSelectedRef.current = false
        onFocus?.(e)
        return
      }
      setOpen(true)
      onFocus?.(e)
    },
    [justSelectedRef, onFocus, setOpen]
  )

  // Use a ref to track blur timeout and prevent clearing query when clicking options
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const relatedTarget = e.relatedTarget as HTMLElement | null
      const isMovingToCombobox = relatedTarget?.closest(`[id="${listboxId}"]`) !== null
      const isClickingOption = isClickingOptionRef?.current === true
      
      // Don't close when clicking an option - let the click handler close (avoids unmount before click)
      if (!isMovingToCombobox && !isClickingOption) {
        setOpen(false)
      }
      
      // Only clear query on blur if:
      // 1. Not moving focus to combobox option
      // 2. We have a selected value
      // 3. The current query doesn't match what the user typed (they selected something)
      // This prevents clearing while user is actively typing
      if (!isMovingToCombobox && value && query.length > 0) {
        const selectedText = getOptionText(value) ?? value
        // Only clear if query doesn't match selected value (meaning user selected, not typing)
        if (query !== selectedText) {
          blurTimeoutRef.current = setTimeout(() => {
            setQuery("")
          }, 800)
        }
      }
      
      onBlur?.(e)
    },
    [getOptionText, isClickingOptionRef, listboxId, onBlur, query, setOpen, setQuery, value]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault()
          if (!open) {
            setOpen(true)
            return
          }
          const visible = getVisibleValues()
          if (visible.length === 0) break
          const currentIndex = activeValue ? visible.indexOf(activeValue) : -1
          const nextIndex = currentIndex < visible.length - 1 ? currentIndex + 1 : 0
          const next = visible[nextIndex]
          if (next) {
            setActiveValue(next)
            // Scroll into view
            if (getOptionElement) {
              const nextElement = getOptionElement(next)
              nextElement?.scrollIntoView({ block: "nearest", behavior: "smooth" })
            }
          }
          break
        }
        case "ArrowUp": {
          e.preventDefault()
          if (!open) {
            setOpen(true)
            return
          }
          const visible = getVisibleValues()
          if (visible.length === 0) break
          const currentIndex = activeValue ? visible.indexOf(activeValue) : visible.length
          const nextIndex = currentIndex > 0 ? currentIndex - 1 : visible.length - 1
          const next = visible[nextIndex]
          if (next) {
            setActiveValue(next)
            // Scroll into view
            if (getOptionElement) {
              const nextElement = getOptionElement(next)
              nextElement?.scrollIntoView({ block: "nearest", behavior: "smooth" })
            }
          }
          break
        }
        case "Home":
        case "End": {
          if (open) {
            e.preventDefault()
            const visible = getVisibleValues()
            if (visible.length === 0) break
            const targetValue = e.key === "Home" ? visible[0] : visible[visible.length - 1]
            if (targetValue) {
              setActiveValue(targetValue)
              if (getOptionElement) {
                const targetElement = getOptionElement(targetValue)
                targetElement?.scrollIntoView({ block: "nearest", behavior: "smooth" })
              }
            }
          }
          break
        }
        case "Enter": {
          if (!open) break
          if (!activeValue) break
          if (getOptionDisabled(activeValue)) break
          e.preventDefault()
          setValue(activeValue)
          setOpen(false)
          setQuery("")
          break
        }
        case "Escape":
          setOpen(false)
          setQuery("")
          break
        default:
          break
      }
      onKeyDown?.(e)
    },
    [
      activeValue,
      getOptionDisabled,
      getOptionElement,
      getVisibleValues,
      onKeyDown,
      open,
      setActiveValue,
      setOpen,
      setQuery,
      setValue,
    ]
  )

  // If query is empty, show the selected option text (purely visual).
  // Use value !== undefined so empty string "" (e.g. "Default" option) displays correctly
  const inputValue = query.length > 0 ? query : (value !== undefined ? (getOptionText(value) ?? value) : "")

  const handleWrapperClick = useCallback(() => {
    if (disabledCtx) return
    inputRef.current?.focus()
  }, [disabledCtx])

  return (
    <div
      onClick={handleWrapperClick}
      className={cn(
        DEFAULT_TRIGGER_CLASSES,
        disabledCtx
          ? "cursor-not-allowed opacity-60"
          : "cursor-text hover:bg-background/15 hover:border-(--pw-border)/80 active:bg-background/20",
        open && "border-(--pw-border)/80",
        triggerClassName
      )}
    >
      <input
        {...props}
        ref={(el) => {
          inputRef.current = el
        }}
        id={inputId}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={ariaActiveDescendant}
        disabled={disabledCtx}
        value={inputValue}
        placeholder={displayPlaceholder}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex-1 min-w-0 border-0 bg-transparent px-3 py-2 text-sm text-foreground outline-none",
          className
        )}
      />
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-foreground/70 transition-transform duration-200 mr-3 pointer-events-none",
          open && "rotate-180",
          chevronClassName
        )}
        aria-hidden
      />
    </div>
  )
}

