"use client"
import { useCallback, useEffect, useMemo, useRef, type FC } from "react"
import { cn } from "@/lib/cn"
import type { SelectOptionProps } from "./types"
import { useSelectContext } from "./Context"
import { Button } from "@/app/components/Button"
import { CheckIcon } from "lucide-react"

export const SelectOption: FC<SelectOptionProps> = ({
  className,
  value: optionValue,
  disabled: disabledProp,
  label,
  children,
  onClick,
  ...buttonProps
}) => {
  const {
    multiple,
    value,
    setValue,
    disabled: disabledCtx,
    registerOption,
    unregisterOption,
    setOpen,
    focusedValue,
    setFocusedValue,
  } = useSelectContext()

  const disabled = disabledCtx || disabledProp
  const optionRef = useRef<HTMLButtonElement>(null)

  const isSelected = useMemo(() => {
    if (multiple) {
      const arr = Array.isArray(value) ? value : []
      return arr.includes(optionValue)
    }
    return value === optionValue
  }, [multiple, optionValue, value])

  const isFocused = focusedValue === optionValue

  const optionLabel = label ?? children
  useEffect(() => {
    registerOption(optionValue, optionLabel, optionRef.current)
    return () => unregisterOption(optionValue)
  }, [optionLabel, optionValue, registerOption, unregisterOption])

  // Focus this option when it becomes the focused value
  useEffect(() => {
    if (isFocused && optionRef.current) {
      optionRef.current.focus()
    }
  }, [isFocused])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return

      if (multiple) {
        const arr = Array.isArray(value) ? value : []
        const next = isSelected ? arr.filter((v) => v !== optionValue) : [...arr, optionValue]
        setValue(next)
      } else {
        setValue(optionValue)
        setOpen(false)
      }

      onClick?.(e)
    },
    [disabled, isSelected, multiple, onClick, optionValue, setOpen, setValue, value]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return

      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault()
          if (multiple) {
            const arr = Array.isArray(value) ? value : []
            const next = isSelected ? arr.filter((v) => v !== optionValue) : [...arr, optionValue]
            setValue(next)
          } else {
            setValue(optionValue)
            setOpen(false)
          }
          break
        default:
          break
      }
    },
    [disabled, isSelected, multiple, optionValue, setOpen, setValue, value]
  )

  const handleFocus = useCallback(() => {
    setFocusedValue(optionValue)
  }, [optionValue, setFocusedValue])

  return (
    <li className="list-none">
      <Button
        {...buttonProps}
        ref={optionRef}
        type="button"
        role="option"
        aria-selected={isSelected}
        data-value={optionValue}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors",
          "outline-none focus-visible:ring-2 focus-visible:ring-(--pw-ring) focus-visible:ring-offset-1",
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:bg-background/20 active:bg-background/30",
          isSelected && "bg-background/15 font-medium",
          isFocused && !isSelected && "bg-background/10",
          className
        )}
      >
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-foreground/70">
          {isSelected ? <CheckIcon className="h-4 w-4" /> : null}
        </span>
        <span className="min-w-0 flex-1 truncate">{children}</span>
      </Button>
    </li>
  )
}
