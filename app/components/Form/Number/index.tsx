"use client"

import { useCallback, useId, useMemo, useState, type ChangeEvent, type FC } from "react"
import type { NumberInputProps } from "./types"
import { cn } from "@/lib/cn"
import { ChevronDown, ChevronUp } from "lucide-react"

function clamp(n: number, min?: number, max?: number) {
  if (typeof min === "number") n = Math.max(min, n)
  if (typeof max === "number") n = Math.min(max, n)
  return n
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n)
}

export const NumberInput: FC<NumberInputProps> = ({
  className,
  inputClassName,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  disabled,
  id: idProp,
  min,
  max,
  step = 1,
  name,
  spinnerPosition = "right",
  ...inputProps
}) => {
  const generatedId = useId()
  const inputId = idProp ?? `${generatedId}-number`

  const isControlled = valueProp !== undefined
  const [uncontrolled, setUncontrolled] = useState<number | null>(defaultValue)
  const value = isControlled ? (valueProp as number | null) : uncontrolled

  const valueAsString = useMemo(() => {
    if (value === null || value === undefined) return ""
    return String(value)
  }, [value])

  const emit = useCallback(
    (next: number | null) => {
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      if (raw === "") {
        emit(null)
        return
      }

      const n = Number(raw)
      if (!Number.isFinite(n)) return
      const minNum = min != null ? Number(min) : undefined
      const maxNum = max != null ? Number(max) : undefined
      emit(clamp(n, minNum, maxNum))
    },
    [emit, max, min]
  )

  const bump = useCallback(
    (dir: -1 | 1) => {
      if (disabled) return

      const current = isFiniteNumber(value) ? value : 0
      const minNum = min != null ? Number(min) : undefined
      const maxNum = max != null ? Number(max) : undefined
      const next = clamp(current + dir * Number(step ?? 1), minNum, maxNum)
      emit(next)
    },
    [disabled, emit, max, min, step, value]
  )

  const isVertical = spinnerPosition === "top-bottom"

  const inputClasses = cn(
    "h-10 min-w-0 flex-1 text-sm text-foreground outline-none transition-colors",
    "focus-visible:ring-2 focus-visible:ring-(--pw-ring) focus-visible:ring-inset",
    disabled ? "cursor-not-allowed opacity-60" : "hover:bg-background/10",
    "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
    "[-moz-appearance:textfield]",
    isVertical ? "rounded-lg border border-(--pw-border) bg-background/10 px-3 pr-10" : "rounded-l-lg border border-(--pw-border) border-r-0 bg-background/10 px-3 pr-2",
    inputClassName
  )

  const spinnerWrapperClasses = cn(
    "flex shrink-0 items-stretch overflow-hidden rounded-r-lg border border-(--pw-border) border-l-0 bg-background/10",
    isVertical && "absolute right-0 top-0 h-full rounded-l-none rounded-r-lg border-l border-(--pw-border)"
  )

  const spinnerButtonClasses = cn(
    "flex flex-1 items-center justify-center text-foreground/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--pw-ring) focus-visible:ring-inset",
    disabled ? "cursor-not-allowed" : "hover:bg-background/20 hover:text-foreground"
  )

  return (
    <div
      className={cn(
        "flex w-full max-w-full",
        isVertical ? "relative" : "",
        className
      )}
      data-disabled={disabled ? "" : undefined}
    >
      <input
        {...inputProps}
        id={inputId}
        name={name}
        type="number"
        inputMode="decimal"
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        value={valueAsString}
        onChange={onChange}
        className={inputClasses}
      />

      {isVertical ? (
        <div className={cn(spinnerWrapperClasses, "w-9 flex-col py-0.5")}>
          <button
            type="button"
            onClick={() => bump(1)}
            disabled={disabled}
            className={cn(spinnerButtonClasses, "min-h-0 flex-1 rounded-none")}
            aria-label="Increment"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <div className="h-px shrink-0 bg-(--pw-border)" />
          <button
            type="button"
            onClick={() => bump(-1)}
            disabled={disabled}
            className={cn(spinnerButtonClasses, "min-h-0 flex-1 rounded-none")}
            aria-label="Decrement"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className={cn(spinnerWrapperClasses, "h-10 w-10 flex-col")}>
          <button
            type="button"
            onClick={() => bump(1)}
            disabled={disabled}
            className={cn(spinnerButtonClasses, "flex-1 rounded-none rounded-tr-lg")}
            aria-label="Increment"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <div className="h-px shrink-0 bg-(--pw-border)" />
          <button
            type="button"
            onClick={() => bump(-1)}
            disabled={disabled}
            className={cn(spinnerButtonClasses, "flex-1 rounded-none rounded-br-lg")}
            aria-label="Decrement"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

