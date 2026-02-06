"use client"
import { useCallback, useMemo, useRef, useEffect, type FC } from "react"
import type { ComboboxInputProps } from "./types"
import { cn } from "@/lib/cn"
import { useComboboxContext } from "./Context"

export const ComboboxInput: FC<ComboboxInputProps> = ({
  className,
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
      setOpen(true)
      onFocus?.(e)
    },
    [onFocus, setOpen]
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
      // Don't clear if focus is moving to an option or within the combobox
      const isMovingToCombobox = relatedTarget?.closest(`[id="${listboxId}"]`) !== null
      
      setOpen(false)
      
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
    [getOptionText, listboxId, onBlur, query, setOpen, setQuery, value]
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
  const inputValue = query.length > 0 ? query : (value ? (getOptionText(value) ?? value) : "")

  return (
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
        "h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none",
        "transition-all duration-200",
        "focus-visible:ring-2 focus-visible:ring-(--pw-ring) focus-visible:ring-offset-2",
        disabledCtx
          ? "cursor-not-allowed opacity-60"
          : "hover:bg-background/15 hover:border-(--pw-border)/80 active:bg-background/20",
        open && "border-(--pw-border)/80",
        className
      )}
    />
  )
}

