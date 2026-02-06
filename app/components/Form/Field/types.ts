import type { HTMLAttributes, ReactNode } from "react"
import type { ClassValue } from "clsx"

export type FieldProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  className?: ClassValue

  /** Label shown above the control */
  label?: ReactNode
  labelClassName?: ClassValue
  /** id of the control (for label htmlFor) */
  htmlFor?: string

  /** Description or hint below the control */
  description?: ReactNode
  descriptionClassName?: ClassValue

  /** Error message (e.g. from validation); typically styled as destructive */
  error?: ReactNode
  errorClassName?: ClassValue

  /** Show required asterisk next to label when true */
  required?: boolean

  /** The form control(s) to wrap */
  children: ReactNode
}
