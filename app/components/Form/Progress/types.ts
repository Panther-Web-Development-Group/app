import type { HTMLAttributes, ReactNode } from "react"
import type { ClassValue } from "clsx"

export type ProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  className?: ClassValue

  /** Current progress (0 to max, or 0–100 if max is omitted) */
  value?: number
  /** Maximum value (default 100); progress percent = (value / max) * 100 */
  max?: number
  /** When true, shows indeterminate (animated) progress bar; value is ignored */
  indeterminate?: boolean

  /** Optional label (e.g. "Uploading...") */
  label?: ReactNode
  /** Show numeric value next to the bar (e.g. "60%") */
  showValue?: boolean
  /** Value formatter (default: percent) */
  formatValue?: (value: number, max: number) => string
}
