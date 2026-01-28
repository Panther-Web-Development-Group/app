 "use client"
import { useCallback, useMemo, type FC } from "react"
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

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setOpen(false)
      setQuery("")
      onBlur?.(e)
    },
    [onBlur, setOpen, setQuery]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault()
          if (!open) setOpen(true)
          const visible = getVisibleValues()
          if (visible.length === 0) break
          const currentIndex = activeValue ? visible.indexOf(activeValue) : -1
          const next = visible[Math.min(currentIndex + 1, visible.length - 1)]
          if (next) setActiveValue(next)
          break
        }
        case "ArrowUp": {
          e.preventDefault()
          if (!open) setOpen(true)
          const visible = getVisibleValues()
          if (visible.length === 0) break
          const currentIndex = activeValue ? visible.indexOf(activeValue) : visible.length
          const next = visible[Math.max(currentIndex - 1, 0)]
          if (next) setActiveValue(next)
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
        "transition-colors",
        "focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
        disabledCtx ? "cursor-not-allowed opacity-60" : "hover:bg-background/15",
        className
      )}
    />
  )
}

