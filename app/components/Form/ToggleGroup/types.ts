import type { HTMLAttributes, ReactNode } from "react"
import type { ClassValue } from "clsx"

export type ToggleGroupOption = {
  value: string
  label: ReactNode
  disabled?: boolean
}

export type ToggleGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  className?: ClassValue

  /** Options to display as segments */
  options: ToggleGroupOption[]
  /** Selected value (single) or values (multiple) */
  value?: string | string[]
  /** Initial value when uncontrolled */
  defaultValue?: string | string[]
  /** Called when selection changes */
  onValueChange?: (value: string | string[]) => void

  /** Allow multiple selection (default false) */
  multiple?: boolean
  /** Name for form submission (single: one input; multiple: multiple inputs) */
  name?: string
  disabled?: boolean
  /** Size of each segment */
  size?: "sm" | "md" | "lg"
}
