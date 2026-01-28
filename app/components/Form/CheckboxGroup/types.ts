import type { HTMLAttributes, ReactNode } from "react"
import type { ClassValue } from "clsx"
import type { CheckboxProps } from "../Checkbox/types"

export type CheckboxGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  className?: ClassValue

  /** If provided, the group is controlled */
  value?: string[]
  /** Initial value for uncontrolled usage */
  defaultValue?: string[]
  /** Fired with the next value array whenever selection changes */
  onValueChange?: (value: string[]) => void

  /** Name applied to all checkbox inputs (enables native form submission) */
  name?: string
  /** Disable all options (options can still opt-out via their own `disabled`) */
  disabled?: boolean
}

export type CheckboxGroupOptionProps = Omit<
  CheckboxProps,
  "checked" | "defaultChecked" | "onCheckedChange" | "name" | "value"
> & {
  /** Value to add/remove from the group */
  value: string
  /** Optional label shown next to the box */
  label?: ReactNode
  /** Disable just this option */
  disabled?: boolean

  /** Fired after the group updates */
  onCheckedChange?: (checked: boolean) => void
}

