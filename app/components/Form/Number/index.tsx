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
      emit(clamp(n, min, max))
    },
    [emit, max, min]
  )

  const bump = useCallback(
    (dir: -1 | 1) => {
      if (disabled) return

      const current = isFiniteNumber(value) ? value : 0
      const next = clamp(current + dir * Number(step || 1), min, max)
      emit(next)
    },
    [disabled, emit, max, min, step, value]
  )

  const isVertical = spinnerPosition === "top-bottom"

  return (
    <div className={cn("relative", className)} data-disabled={disabled ? "" : undefined}>
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
        className={cn(
          "h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none",
          "transition-colors",
          "focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
          disabled ? "cursor-not-allowed opacity-60" : "hover:bg-background/15",
          // Hide native spinners
          "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          "[-moz-appearance:textfield]",
          // Adjust padding based on spinner position
          isVertical ? "pr-3" : "pr-12",
          inputClassName
        )}
      />

      {isVertical ? (
        <div className="absolute right-0.5 top-0 flex h-full flex-col justify-between py-0.5">
          <button
            type="button"
            onClick={() => bump(1)}
            disabled={disabled}
            className={cn(
              "flex h-3 w-5 items-center justify-center rounded-t border border-(--pw-border) bg-background/10 text-foreground/70 transition-colors",
              disabled ? "cursor-not-allowed" : "hover:bg-background/20"
            )}
            aria-label="Increment"
          >
            <ChevronUp className="h-2.5 w-2.5" />
          </button>
          <button
            type="button"
            onClick={() => bump(-1)}
            disabled={disabled}
            className={cn(
              "flex h-3 w-5 items-center justify-center rounded-b border-t border-(--pw-border) bg-background/10 text-foreground/70 transition-colors",
              disabled ? "cursor-not-allowed" : "hover:bg-background/20"
            )}
            aria-label="Decrement"
          >
            <ChevronDown className="h-2.5 w-2.5" />
          </button>
        </div>
      ) : (
        <div className="absolute right-1 top-1/2 -translate-y-1/2">
          <div className="grid h-8 w-10 grid-rows-2 overflow-hidden rounded-md border border-(--pw-border) bg-background/10">
            <button
              type="button"
              onClick={() => bump(1)}
              disabled={disabled}
              className={cn(
                "flex items-center justify-center text-foreground/70 transition-colors",
                disabled ? "cursor-not-allowed" : "hover:bg-background/20"
              )}
              aria-label="Increment"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => bump(-1)}
              disabled={disabled}
              className={cn(
                "flex items-center justify-center border-t border-(--pw-border) text-foreground/70 transition-colors",
                disabled ? "cursor-not-allowed" : "hover:bg-background/20"
              )}
              aria-label="Decrement"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

