import type { HTMLAttributes } from "react"
import type { ClassValue } from "clsx"

export type SliderOrientation = "horizontal" | "vertical"

export type SliderProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  className?: ClassValue

  name?: string
  disabled?: boolean

  min?: number
  max?: number
  step?: number

  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void

  orientation?: SliderOrientation
}

export type RangeSliderProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  className?: ClassValue

  /** Optional base name; if provided, submits as `${name}_min` and `${name}_max` by default */
  name?: string
  nameMin?: string
  nameMax?: string
  disabled?: boolean

  min?: number
  max?: number
  step?: number

  value?: [number, number]
  defaultValue?: [number, number]
  onValueChange?: (value: [number, number]) => void
}

