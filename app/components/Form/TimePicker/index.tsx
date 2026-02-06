"use client"

import { useCallback, useId, useState, type FC } from "react"
import type { TimePickerProps } from "./types"
import { cn } from "@/lib/cn"
import { Input } from "../Input"

function toInputValue(v: string | null | undefined, showSeconds: boolean): string {
  if (!v || !v.trim()) return ""
  const parts = v.trim().split(":")
  const h = parts[0] ?? "00"
  const m = parts[1] ?? "00"
  const s = parts[2] ?? "00"
  if (showSeconds) return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:${s.padStart(2, "0")}`
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`
}

export const TimePicker: FC<TimePickerProps> = ({
  className,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  min,
  max,
  step = 60,
  disabled = false,
  name,
  placeholder = "Select time…",
  showSeconds = false,
  id: idProp,
  ...divProps
}) => {
  const isControlled = valueProp !== undefined
  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultValue ?? null)
  const value = isControlled ? (valueProp as string | null) : uncontrolled
  const inputValue = toInputValue(value ?? "", showSeconds)

  const generatedId = useId()
  const inputId = idProp ?? generatedId

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      const next = raw ? raw : null
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )

  const stepAttr = showSeconds ? step : Math.max(1, Math.floor(step / 60))

  return (
    <div {...divProps} className={cn("w-full", className)}>
      <Input
        id={inputId}
        type="time"
        value={inputValue}
        onChange={handleChange}
        min={min ?? undefined}
        max={max ?? undefined}
        step={showSeconds ? step : stepAttr}
        disabled={disabled}
        name={name}
        aria-label={divProps["aria-label"] ?? "Time"}
        className={cn(
          "h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none",
          "transition-colors focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
          disabled ? "cursor-not-allowed opacity-60" : "hover:bg-background/15"
        )}
      />
    </div>
  )
}
