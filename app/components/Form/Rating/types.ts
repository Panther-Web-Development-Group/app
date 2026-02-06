import type { HTMLAttributes, ReactNode } from "react"
import type { ClassValue } from "clsx"

export type RatingProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  className?: ClassValue

  /** Current value (1 to max, or 0 for empty) */
  value?: number
  /** Initial value when uncontrolled */
  defaultValue?: number
  /** Called when user selects a value */
  onValueChange?: (value: number) => void

  /** Maximum rating (default 5) */
  max?: number
  /** Allow half-star selection (default false) */
  halfStars?: boolean
  disabled?: boolean
  /** Name for form submission */
  name?: string
  /** Custom icon (default Star from lucide) */
  icon?: ReactNode
  /** Size of each star */
  size?: "sm" | "md" | "lg"
}
