import type { HTMLAttributes } from "react"
import type { ClassValue } from "clsx"

export type DateTimePickerProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  className?: ClassValue

  name?: string
  disabled?: boolean

  /** ISO datetime string: YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void

  placeholder?: string
  /** Min datetime (ISO string, optional) */
  min?: string | null
  /** Max datetime (ISO string, optional) */
  max?: string | null
  /** Include seconds in value and time input (default false) */
  showSeconds?: boolean
}
