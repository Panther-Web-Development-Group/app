"use client"
import { useCallback, useId, useMemo, useState, type FC } from "react"
import type { RangeSliderProps, SliderOrientation, SliderProps } from "./types"
import { cn } from "@/lib/cn"

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function percent(value: number, min: number, max: number) {
  if (max <= min) return 0
  return ((value - min) / (max - min)) * 100
}

export const Slider: FC<SliderProps> = ({
  className,
  name,
  disabled,
  min = 0,
  max = 100,
  step = 1,
  value: valueProp,
  defaultValue = min,
  onValueChange,
  orientation = "horizontal",
  ...divProps
}) => {
  const isControlled = typeof valueProp === "number"
  const [uncontrolled, setUncontrolled] = useState<number>(defaultValue)
  const value = clamp(isControlled ? (valueProp as number) : uncontrolled, min, max)

  const p = useMemo(() => percent(value, min, max), [max, min, value])
  const generatedId = useId()
  const inputId = `${generatedId}-slider`

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = clamp(Number(e.target.value), min, max)
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    },
    [isControlled, max, min, onValueChange]
  )

  const isVertical = orientation === "vertical"

  return (
    <div
      {...divProps}
      className={cn(
        "relative select-none",
        isVertical ? "h-48 w-10" : "h-10 w-full",
        className
      )}
      data-orientation={orientation}
    >
      {/* Track */}
      <div
        className={cn(
          "absolute rounded-full border border-(--pw-border) bg-background/10 shadow-[0_10px_30px_var(--pw-shadow)]",
          isVertical ? "left-1/2 top-2 h-[calc(100%-1rem)] w-2 -translate-x-1/2" : "left-2 top-1/2 h-2 w-[calc(100%-1rem)] -translate-y-1/2"
        )}
        aria-hidden
      >
        <div
          className={cn(
            "absolute rounded-full bg-accent/30",
            "shadow-[0_0_0_1px_var(--pw-border),0_0_40px_color-mix(in_oklab,var(--pw-info)_25%,transparent)]"
          )}
          style={
            isVertical
              ? { bottom: 0, height: `${p}%`, left: 0, right: 0 }
              : { left: 0, width: `${p}%`, top: 0, bottom: 0 }
          }
        />
      </div>

      {/* Thumb */}
      <div
        aria-hidden
        className={cn(
          "absolute h-5 w-5 rounded-full border border-(--pw-border) bg-foreground/80",
          "shadow-[0_10px_30px_var(--pw-shadow)]",
          "transition-transform",
          isVertical ? "left-1/2 -translate-x-1/2" : "top-1/2 -translate-y-1/2",
          disabled ? "opacity-60" : ""
        )}
        style={
          isVertical
            ? { bottom: `calc(${p}% + 0.5rem)`, transform: "translateX(-50%) translateY(50%)" }
            : { left: `calc(${p}% + 0.5rem)`, transform: "translateX(-50%) translateY(-50%)" }
        }
      />

      {/* Native input (keyboard + a11y); visually hidden but interactive */}
      <input
        id={inputId}
        name={name}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={cn(
          "peer absolute inset-0 cursor-pointer opacity-0",
          "focus-visible:outline-none"
        )}
        style={isVertical ? { writingMode: "vertical-rl", direction: "rtl" } : undefined}
        aria-orientation={orientation}
      />

      {/* Focus ring */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-lg",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-(--pw-ring)"
        )}
      />
    </div>
  )
}

export const RangeSlider: FC<RangeSliderProps> = ({
  className,
  name,
  nameMin: nameMinProp,
  nameMax: nameMaxProp,
  disabled,
  min = 0,
  max = 100,
  step = 1,
  value: valueProp,
  defaultValue = [min, max],
  onValueChange,
  ...divProps
}) => {
  const isControlled = Array.isArray(valueProp)
  const [uncontrolled, setUncontrolled] = useState<[number, number]>(defaultValue)
  const value = isControlled ? (valueProp as [number, number]) : uncontrolled
  const [minVal, maxVal] = useMemo(() => {
    const a = clamp(value[0], min, max)
    const b = clamp(value[1], min, max)
    return a <= b ? [a, b] : [b, a]
  }, [max, min, value])

  const pMin = useMemo(() => percent(minVal, min, max), [max, min, minVal])
  const pMax = useMemo(() => percent(maxVal, min, max), [max, min, maxVal])

  const [activeThumb, setActiveThumb] = useState<"min" | "max" | null>(null)

  const nameMin = nameMinProp ?? (name ? `${name}_min` : undefined)
  const nameMax = nameMaxProp ?? (name ? `${name}_max` : undefined)

  const emit = useCallback(
    (next: [number, number]) => {
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )

  const onMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextMin = clamp(Number(e.target.value), min, maxVal)
      emit([nextMin, maxVal])
    },
    [emit, maxVal, min, minVal, max]
  )

  const onMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextMax = clamp(Number(e.target.value), minVal, max)
      emit([minVal, nextMax])
    },
    [emit, max, min, minVal, maxVal]
  )

  return (
    <div
      {...divProps}
      className={cn("relative h-10 w-full select-none", className)}
    >
      {/* Hidden inputs for native form submission */}
      {nameMin ? <input type="hidden" name={nameMin} value={String(minVal)} /> : null}
      {nameMax ? <input type="hidden" name={nameMax} value={String(maxVal)} /> : null}

      {/* Track */}
      <div
        className="absolute left-2 top-1/2 h-2 w-[calc(100%-1rem)] -translate-y-1/2 rounded-full border border-(--pw-border) bg-background/10 shadow-[0_10px_30px_var(--pw-shadow)]"
        aria-hidden
      >
        <div
          className={cn(
            "absolute top-0 bottom-0 rounded-full bg-accent/30",
            "shadow-[0_0_0_1px_var(--pw-border),0_0_40px_color-mix(in_oklab,var(--pw-info)_25%,transparent)]"
          )}
          style={{ left: `${pMin}%`, width: `${Math.max(0, pMax - pMin)}%` }}
        />
      </div>

      {/* Thumbs */}
      <div
        aria-hidden
        className={cn(
          "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-(--pw-border) bg-foreground/80 shadow-[0_10px_30px_var(--pw-shadow)]",
          disabled ? "opacity-60" : ""
        )}
        style={{ left: `calc(${pMin}% + 0.5rem)`, transform: "translateX(-50%) translateY(-50%)" }}
      />
      <div
        aria-hidden
        className={cn(
          "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-(--pw-border) bg-foreground/80 shadow-[0_10px_30px_var(--pw-shadow)]",
          disabled ? "opacity-60" : ""
        )}
        style={{ left: `calc(${pMax}% + 0.5rem)`, transform: "translateX(-50%) translateY(-50%)" }}
      />

      {/* Range inputs (invisible but interactive) */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        disabled={disabled}
        onPointerDown={() => setActiveThumb("min")}
        onChange={onMinChange}
        className={cn(
          "peer absolute inset-0 cursor-pointer opacity-0",
          activeThumb === "min" ? "z-20" : "z-10"
        )}
        aria-label="Minimum"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        disabled={disabled}
        onPointerDown={() => setActiveThumb("max")}
        onChange={onMaxChange}
        className={cn(
          "peer absolute inset-0 cursor-pointer opacity-0",
          activeThumb === "max" ? "z-20" : "z-10"
        )}
        aria-label="Maximum"
      />

      {/* Focus ring */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-lg",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-(--pw-ring)"
        )}
      />
    </div>
  )
}

export const VerticalSlider: FC<Omit<SliderProps, "orientation">> = (props) => (
  <Slider {...props} orientation={"vertical" as SliderOrientation} />
)

