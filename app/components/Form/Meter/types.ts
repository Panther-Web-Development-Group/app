import type { HTMLAttributes, ReactNode } from "react"
import type { ClassValue } from "clsx"

export type MeterProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  className?: ClassValue

  /** Current value (must be between min and max) */
  value: number
  /** Minimum value (default 0) */
  min?: number
  /** Maximum value (default 100) */
  max?: number
  /** Optional low threshold (below this is "low" state) */
  low?: number
  /** Optional high threshold (above this is "high" state) */
  high?: number
  /** Optional optimum value (for semantic coloring; between low and high is "optimum") */
  optimum?: number

  /** Optional label (e.g. "Disk usage") */
  label?: ReactNode
  /** Show numeric value next to the bar (e.g. "75%") */
  showValue?: boolean
  /** Value formatter (default: percent) */
  formatValue?: (value: number, min: number, max: number) => string
}
