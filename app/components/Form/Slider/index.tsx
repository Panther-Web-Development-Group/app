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
          "absolute rounded-full border border-(--pw-border) bg-background/15",
          isVertical ? "left-1/2 top-2 h-[calc(100%-1rem)] w-2 -translate-x-1/2" : "left-2 top-1/2 h-2.5 w-[calc(100%-1rem)] -translate-y-1/2"
        )}
        aria-hidden
      >
        {/* Fill */}
        <div
          className="absolute inset-0 rounded-full bg-accent/80 transition-[width,height] duration-150 ease-out"
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
          "absolute h-5 w-5 rounded-full border-2 border-(--pw-border) bg-background shadow-sm",
          "transition-[left,bottom] duration-150 ease-out",
          "peer-hover:scale-110 peer-active:scale-105",
          isVertical ? "left-1/2 -translate-x-1/2" : "top-1/2 -translate-y-1/2",
          disabled ? "opacity-60" : ""
        )}
        style={
          isVertical
            ? { bottom: `calc(${p}%) - 0.5rem` }
            : { left: `calc(${p}%) - 0.5rem` }
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

  /** Clip-path split: min input only receives clicks left of mid%, max only right of mid%. */
  const mid = (pMin + pMax) / 2

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
    [emit, maxVal, min]
  )

  const onMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextMax = clamp(Number(e.target.value), minVal, max)
      emit([minVal, nextMax])
    },
    [emit, max, minVal]
  )

  return (
    <div
      {...divProps}
      className={cn("relative h-10 w-full select-none group/range", className)}
    >
      {/* Hidden inputs for native form submission */}
      {nameMin ? <input type="hidden" name={nameMin} value={String(minVal)} /> : null}
      {nameMax ? <input type="hidden" name={nameMax} value={String(maxVal)} /> : null}

      {/* Track */}
      <div
        className="absolute left-2 top-1/2 h-2.5 w-[calc(100%-1rem)] -translate-y-1/2 rounded-full border border-(--pw-border) bg-background/15"
        aria-hidden
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-accent/80 transition-[width] duration-150 ease-out"
          style={{ left: `${pMin}%`, width: `${Math.max(0, pMax - pMin)}%` }}
        />
      </div>

      {/* Thumbs */}
      <div
        aria-hidden
        className={cn(
          "absolute top-1/2 z-10 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-(--pw-border) bg-background shadow-sm transition-[left] duration-150 ease-out",
          disabled ? "opacity-60" : ""
        )}
        style={{ left: `calc(${pMin}% + 0.5rem)` }}
      />
      <div
        aria-hidden
        className={cn(
          "absolute top-1/2 z-10 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-(--pw-border) bg-background shadow-sm transition-[left] duration-150 ease-out",
          disabled ? "opacity-60" : ""
        )}
        style={{ left: `calc(${pMax}% + 0.5rem)` }}
      />

      {/* Full-width range inputs; clip-path restricts which half receives clicks so value maps correctly */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        disabled={disabled}
        onChange={onMinChange}
        style={{ clipPath: `inset(0 ${100 - mid}% 0 0)` }}
        className="peer/min absolute inset-0 z-0 h-full w-full cursor-pointer opacity-0 focus-visible:outline-none"
        aria-label="Minimum"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        disabled={disabled}
        onChange={onMaxChange}
        style={{ clipPath: `inset(0 0 0 ${mid}%)` }}
        className="peer/max absolute inset-0 z-0 h-full w-full cursor-pointer opacity-0 focus-visible:outline-none"
        aria-label="Maximum"
      />

      {/* Focus ring when either input is focused */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-lg",
          "group-focus-within/range:ring-2 group-focus-within/range:ring-(--pw-ring)"
        )}
      />
    </div>
  )
}

export const VerticalSlider: FC<Omit<SliderProps, "orientation">> = (props) => (
  <Slider {...props} orientation={"vertical" as SliderOrientation} />
)

