"use client"

import { useId, useMemo, type FC } from "react"
import type { MeterProps } from "./types"
import { cn } from "@/lib/cn"

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function percent(value: number, min: number, max: number) {
  if (max <= min) return 0
  return ((value - min) / (max - min)) * 100
}

export const Meter: FC<MeterProps> = ({
  className,
  value,
  min = 0,
  max = 100,
  low,
  high,
  optimum,
  label,
  showValue = false,
  formatValue = (v, mn, mx) => `${Math.round(percent(v, mn, mx))}%`,
  id: idProp,
  ...divProps
}) => {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const labelId = `${id}-label`
  const valueId = `${id}-value`

  const clamped = useMemo(() => clamp(value, min, max), [max, min, value])
  const pct = useMemo(() => percent(clamped, min, max), [clamped, max, min])

  const variant = useMemo(() => {
    if (low !== undefined && high !== undefined) {
      if (optimum !== undefined) {
        const opt = clamp(optimum, min, max)
        if (clamped < low) return opt >= high ? "low" : "high"
        if (clamped > high) return opt <= low ? "high" : "low"
        return "optimum"
      }
      if (clamped < low) return "low"
      if (clamped > high) return "high"
    }
    return "default"
  }, [clamped, high, low, max, min, optimum])

  const fillClass = useMemo(() => {
    switch (variant) {
      case "low":
        return "bg-warning"
      case "high":
        return "bg-danger"
      case "optimum":
        return "bg-success"
      default:
        return "bg-accent"
    }
  }, [variant])

  return (
    <div
      {...divProps}
      id={id}
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={showValue ? valueId : undefined}
      className={cn("w-full", className)}
    >
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          {label ? (
            <span id={labelId} className="text-sm font-medium text-foreground/80">
              {label}
            </span>
          ) : (
            <span />
          )}
          {showValue ? (
            <span id={valueId} className="text-sm tabular-nums text-foreground/70">
              {formatValue(clamped, min, max)}
            </span>
          ) : null}
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full border border-(--pw-border) bg-background/10"
        aria-hidden
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-200 ease-out", fillClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
