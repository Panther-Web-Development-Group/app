import type { HTMLAttributes, ReactNode } from "react"
import type { ClassValue } from "clsx"
import type { RadioProps } from "../Radio/types"

export type RadioGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  className?: ClassValue

  /** If provided, the group is controlled */
  value?: string
  /** Initial value for uncontrolled usage */
  defaultValue?: string
  /** Fired with the next value whenever selection changes */
  onValueChange?: (value: string) => void

  /** Name applied to all radio inputs (required for native grouping) */
  name?: string
  /** Disable all options (options can still opt-out via their own `disabled`) */
  disabled?: boolean
}

export type RadioGroupOptionProps = Omit<
  RadioProps,
  "checked" | "defaultChecked" | "onCheckedChange" | "name" | "value"
> & {
  value: string
  label?: ReactNode
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
}

