import type { HTMLAttributes, ReactNode } from "react"
import type { ClassValue } from "clsx"

export type CircularProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  className?: ClassValue

  /** Current progress (0 to max, or 0–100 if max is omitted) */
  value?: number
  /** Maximum value (default 100); progress percent = (value / max) * 100 */
  max?: number
  /** When true, shows indeterminate (animated) circular progress; value is ignored */
  indeterminate?: boolean

  /** Size of the circle in pixels (default 48) */
  size?: number
  /** Stroke width of the progress ring (default 4) */
  strokeWidth?: number

  /** Optional label (e.g. "Uploading...") */
  label?: ReactNode
  /** Show numeric value inside the circle (e.g. "60%") */
  showValue?: boolean
  /** Value formatter (default: percent) */
  formatValue?: (value: number, max: number) => string
}
