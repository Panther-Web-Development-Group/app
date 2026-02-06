"use client"

import { useId, useMemo, type FC } from "react"
import type { ProgressProps } from "./types"
import { cn } from "@/lib/cn"

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export const Progress: FC<ProgressProps> = ({
  className,
  value = 0,
  max = 100,
  indeterminate = false,
  label,
  showValue = false,
  formatValue = (v, m) => `${Math.round((v / m) * 100)}%`,
  id: idProp,
  ...divProps
}) => {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const labelId = `${id}-label`
  const valueId = `${id}-value`

  const clamped = useMemo(() => (indeterminate ? 0 : clamp(value, 0, max)), [indeterminate, max, value])
  const pct = useMemo(
    () => (indeterminate ? 0 : max > 0 ? (clamped / max) * 100 : 0),
    [clamped, indeterminate, max]
  )

  return (
    <div
      {...divProps}
      id={id}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : clamped}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : max}
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={showValue && !indeterminate ? valueId : undefined}
      aria-valuetext={indeterminate ? "Loading" : undefined}
      className={cn("w-full", className)}
    >
      {(label || (showValue && !indeterminate)) && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          {label ? (
            <span id={labelId} className="text-sm font-medium text-foreground/80">
              {label}
            </span>
          ) : (
            <span />
          )}
          {showValue && !indeterminate ? (
            <span id={valueId} className="text-sm tabular-nums text-foreground/70">
              {formatValue(clamped, max)}
            </span>
          ) : null}
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full border border-(--pw-border) bg-background/10"
        aria-hidden
      >
        {indeterminate ? (
          <div
            className="h-full w-1/2 rounded-full bg-accent"
            style={{ animation: "progress-indeterminate 1.5s ease-in-out infinite" }}
          />
        ) : (
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-200 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
          />
        )}
      </div>
    </div>
  )
}
