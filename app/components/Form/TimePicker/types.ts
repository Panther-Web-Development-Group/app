import type { HTMLAttributes } from "react"
import type { ClassValue } from "clsx"

export type TimePickerProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  className?: ClassValue

  /** Value as "HH:MM" or "HH:MM:SS" */
  value?: string | null
  /** Initial value when uncontrolled */
  defaultValue?: string | null
  /** Called when time changes */
  onValueChange?: (value: string | null) => void

  /** Min time "HH:MM" (optional) */
  min?: string | null
  /** Max time "HH:MM" (optional) */
  max?: string | null
  /** Step in seconds (default 60); native input uses minutes for step */
  step?: number
  disabled?: boolean
  /** Name for form submission */
  name?: string
  placeholder?: string
  /** Include seconds in value (HH:MM:SS) */
  showSeconds?: boolean
}
