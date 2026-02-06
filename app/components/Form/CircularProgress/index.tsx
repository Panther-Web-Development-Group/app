"use client"

import { useId, useMemo, type FC } from "react"
import type { CircularProgressProps } from "./types"
import { cn } from "@/lib/cn"

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export const CircularProgress: FC<CircularProgressProps> = ({
  className,
  value = 0,
  max = 100,
  indeterminate = false,
  size = 48,
  strokeWidth = 4,
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

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference
  const indeterminateDash = circumference * 0.25

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
      className={cn("inline-flex flex-col items-center gap-2", className)}
    >
      <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-background/10"
          />
          {/* Progress arc */}
          <g
            className={indeterminate ? "origin-center" : undefined}
            style={
              indeterminate
                ? {
                    transformOrigin: `${size / 2}px ${size / 2}px`,
                    animation: "circular-progress-indeterminate 1.4s linear infinite",
                  }
                : undefined
            }
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={indeterminate ? `${indeterminateDash} ${circumference}` : circumference}
              strokeDashoffset={indeterminate ? 0 : offset}
              className={cn(
                "text-accent transition-[stroke-dashoffset] duration-200 ease-out"
              )}
            />
          </g>
        </svg>
        {showValue && !indeterminate && (
          <span
            id={valueId}
            className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums text-foreground/90"
          >
            {formatValue(clamped, max)}
          </span>
        )}
      </div>
      {label && (
        <span id={labelId} className="text-sm font-medium text-foreground/80">
          {label}
        </span>
      )}
    </div>
  )
}
