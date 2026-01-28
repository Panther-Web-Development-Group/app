 "use client"
import { useCallback, useEffect, useMemo, type FC } from "react"
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
    value: selectedValue,
    setValue,
    setOpen,
    setQuery,
    clearOnSelect,
    activeValue,
    setActiveValue,
    getOptionId,
    inputId,
  } = useComboboxContext()

  const text = useMemo(() => textValue ?? defaultTextFromChildren(children, value), [children, textValue, value])

  useEffect(() => {
    registerOption(value, { text, disabled: disabledProp })
    return () => unregisterOption(value)
  }, [disabledProp, registerOption, text, unregisterOption, value])

  const disabled = disabledCtx || getOptionDisabled(value) || disabledProp
  const isSelected = selectedValue === value

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
  const isActive = activeValue === value

  const handleMouseEnter = useCallback(() => {
    setActiveValue(value)
  }, [setActiveValue, value])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Keep focus on the input so blur doesn't close before click.
    e.preventDefault()
  }, [])

  const handleClick = useCallback(() => {
    if (disabled) return
    setValue(value)
    setActiveValue(value)
    setOpen(false)
    if (clearOnSelect) setQuery("")

    const input = document.getElementById(inputId) as HTMLInputElement | null
    input?.focus()
  }, [clearOnSelect, disabled, inputId, setActiveValue, setOpen, setQuery, setValue, value])

  if (!matches) return null

  return (
    <div
      {...props}
      id={optionId}
      role="option"
      aria-selected={isSelected}
      data-active={isActive ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={cn(
        "flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-foreground/90",
        disabled ? "cursor-not-allowed opacity-60" : "hover:bg-background/20",
        isActive ? "bg-background/20" : "",
        className
      )}
    >
      <span className="flex h-4 w-4 items-center justify-center text-foreground/70">
        {isSelected ? <CheckIcon className="h-4 w-4" /> : null}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </div>
  )
}

