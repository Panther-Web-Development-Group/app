import type { HTMLAttributes } from "react"
import type { ClassValue } from "clsx"

export type DatePickerProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  className?: ClassValue

  name?: string
  disabled?: boolean

  /** ISO date string: YYYY-MM-DD */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void

  placeholder?: string
  min?: string
  max?: string
}

export type DateRangePickerProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  className?: ClassValue

  /** Optional base name; if provided, submits as `${name}_start` and `${name}_end` by default */
  name?: string
  nameStart?: string
  nameEnd?: string
  disabled?: boolean

  /** ISO date strings: YYYY-MM-DD */
  value?: [string | null, string | null]
  defaultValue?: [string | null, string | null]
  onValueChange?: (value: [string | null, string | null]) => void

  placeholder?: string
  min?: string
  max?: string
}

