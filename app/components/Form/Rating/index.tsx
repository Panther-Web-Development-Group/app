"use client"

import { useCallback, useId, useMemo, useState, type FC } from "react"
import type { RatingProps } from "./types"
import { cn } from "@/lib/cn"
import { Star } from "lucide-react"

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
}

export const Rating: FC<RatingProps> = ({
  className,
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  max = 5,
  halfStars = false,
  disabled = false,
  name,
  icon,
  size = "md",
  ...divProps
}) => {
  const isControlled = valueProp !== undefined
  const [uncontrolled, setUncontrolled] = useState<number>(() =>
    clamp(defaultValue, 0, max)
  )
  const value = clamp(
    isControlled ? (valueProp as number) : uncontrolled,
    0,
    max
  )

  const generatedId = useId()
  const baseName = name ?? `rating-${generatedId}`

  const setValue = useCallback(
    (next: number) => {
      const clamped = clamp(next, 0, max)
      if (!isControlled) setUncontrolled(clamped)
      onValueChange?.(clamped)
    },
    [isControlled, max, onValueChange]
  )

  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const displayValue = hoverValue ?? value

  const items = useMemo(() => Array.from({ length: max }, (_, i) => i + 1), [max])

  const renderIcon = useCallback(
    (filled: boolean) => (
      <span className={cn(sizeClasses[size], "inline-block shrink-0", !filled && "text-foreground/30")}>
        {icon ?? <Star className={sizeClasses[size]} fill={filled ? "currentColor" : "none"} stroke="currentColor" />}
      </span>
    ),
    [icon, size]
  )

  return (
    <div
      {...divProps}
      role="radiogroup"
      aria-label="Rating"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        "inline-flex items-center gap-0.5",
        disabled && "opacity-60 pointer-events-none",
        className
      )}
    >
      {items.map((i) => {
        const full = displayValue >= i
        const half = halfStars && displayValue >= i - 0.5 && displayValue < i
        const effective = half ? i - 0.5 : full ? i : i - 1
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value >= (half ? i - 0.5 : i)}
            aria-label={`${i} ${i === 1 ? "star" : "stars"}`}
            disabled={disabled}
            name={baseName}
            value={i}
            onClick={() => setValue(i)}
            onMouseEnter={() => setHoverValue(i)}
            onMouseLeave={() => setHoverValue(null)}
            className={cn(
              "rounded p-0.5 text-foreground/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
              !disabled && "hover:text-accent",
              (full || half) && "text-accent"
            )}
          >
            {half ? (
              <span className="relative inline-block">
                <span className="block opacity-0">{renderIcon(false)}</span>
                <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                  {renderIcon(true)}
                </span>
              </span>
            ) : (
              renderIcon(full)
            )}
          </button>
        )
      })}
      {name && value > 0 ? (
        <input type="hidden" name={name} value={value} />
      ) : null}
    </div>
  )
}
