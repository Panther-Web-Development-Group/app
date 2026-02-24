"use client"
import { useCallback, useEffect, useMemo, useRef, type FC } from "react"
import type { ComboboxOptionProps } from "./types"
import { cn } from "@/lib/cn"
import { useComboboxContext } from "./Context"
import { CheckIcon } from "lucide-react"

function defaultTextFromChildren(children: React.ReactNode, fallback: string) {
  if (typeof children === "string" || typeof children === "number") return String(children)
  return fallback
}

export const ComboboxOption: FC<ComboboxOptionProps> = ({
  className,
  value,
  disabled: disabledProp,
  textValue,
  children,
  ...props
}) => {
  const {
    disabled: disabledCtx,
    query,
    filter,
    registerOption,
    unregisterOption,
    getOptionText,
    getOptionDisabled,
    getOptionElement,
    value: selectedValue,
    setValue,
    setOpen,
    setQuery,
    clearOnSelect,
    focusInputAfterSelect = true,
    activeValue,
    setActiveValue,
    getOptionId,
    inputId,
    isClickingOptionRef,
    justSelectedRef,
  } = useComboboxContext()

  const text = useMemo(() => textValue ?? defaultTextFromChildren(children, value), [children, textValue, value])
  const optionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerOption(value, { text, disabled: disabledProp }, optionRef.current)
    return () => unregisterOption(value)
  }, [disabledProp, registerOption, text, unregisterOption, value])

  const disabled = disabledCtx || getOptionDisabled(value) || disabledProp
  const isSelected = selectedValue === value
  const isActive = activeValue === value

  const matches = useMemo(() => {
    const q = query.trim()
    if (q.length === 0) return true
    const optText = getOptionText(value) ?? text
    const predicate =
      filter ??
      (({ query, optionText }: { query: string; optionValue: string; optionText: string }) =>
        optionText.toLowerCase().includes(query.toLowerCase()))
    return predicate({ query: q, optionValue: value, optionText: optText })
  }, [filter, getOptionText, query, text, value])

  const optionId = getOptionId(value)

  // Focus this option when it becomes active
  useEffect(() => {
    if (isActive && optionRef.current) {
      // Don't focus on mouse hover, only keyboard navigation
      // The scrollIntoView in Input.tsx handles keyboard navigation
    }
  }, [isActive])

  const handleMouseEnter = useCallback(() => {
    if (!disabled) {
      setActiveValue(value)
    }
  }, [disabled, setActiveValue, value])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Mark that we're clicking so blur doesn't close dropdown before click fires
    if (isClickingOptionRef) isClickingOptionRef.current = true
    // Keep focus on the input so blur doesn't close before click
    e.preventDefault()
  }, [isClickingOptionRef])

  const handleClick = useCallback(() => {
    if (disabled) return
    if (isClickingOptionRef) isClickingOptionRef.current = false
    if (justSelectedRef) justSelectedRef.current = true
    setValue(value)
    setActiveValue(value)
    setOpen(false)
    if (clearOnSelect) setQuery("")

    if (focusInputAfterSelect) {
      const input = document.getElementById(inputId) as HTMLInputElement | null
      setTimeout(() => input?.focus(), 0)
    }
  }, [clearOnSelect, disabled, focusInputAfterSelect, inputId, isClickingOptionRef, justSelectedRef, setActiveValue, setOpen, setQuery, setValue, value])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        if (justSelectedRef) justSelectedRef.current = true
        setValue(value)
        setActiveValue(value)
        setOpen(false)
        if (clearOnSelect) setQuery("")
        if (focusInputAfterSelect) {
          const input = document.getElementById(inputId) as HTMLInputElement | null
          setTimeout(() => input?.focus(), 0)
        }
      }
    },
    [clearOnSelect, disabled, focusInputAfterSelect, inputId, justSelectedRef, setActiveValue, setOpen, setQuery, setValue, value]
  )

  if (!matches) return null

  return (
    <div
      {...props}
      ref={optionRef}
      id={optionId}
      role="option"
      aria-selected={isSelected}
      data-active={isActive ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-value={value}
      tabIndex={-1}
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors",
        "outline-none focus-visible:ring-2 focus-visible:ring-(--pw-ring) focus-visible:ring-offset-1",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "hover:bg-background/20 active:bg-background/30",
        isSelected && "bg-background/15 font-medium",
        isActive && !isSelected && "bg-background/10",
        className
      )}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center text-foreground/70">
        {isSelected ? <CheckIcon className="h-4 w-4" /> : null}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </div>
  )
}
