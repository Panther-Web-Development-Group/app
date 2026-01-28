 "use client"
import { useCallback, useEffect, useMemo, type FC } from "react"
import { cn } from "@/lib/cn"
import type { SelectOptionProps } from "./types"
import { useSelectContext } from "./Context"
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
  } = useSelectContext()

  const disabled = disabledCtx || disabledProp

  const isSelected = useMemo(() => {
    if (multiple) {
      const arr = Array.isArray(value) ? value : []
      return arr.includes(optionValue)
    }
    return value === optionValue
  }, [multiple, optionValue, value])

  const optionLabel = label ?? children
  useEffect(() => {
    registerOption(optionValue, optionLabel)
    return () => unregisterOption(optionValue)
  }, [optionLabel, optionValue, registerOption, unregisterOption])

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

  return (
    <button
      {...buttonProps}
      type="button"
      role="option"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-foreground/90",
        disabled ? "cursor-not-allowed opacity-60" : "hover:bg-background/20",
        isSelected ? "bg-background/20" : "",
        className
      )}
    >
      <span className="flex h-4 w-4 items-center justify-center text-foreground/70">
        {isSelected ? <CheckIcon className="h-4 w-4" /> : null}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  )
}

