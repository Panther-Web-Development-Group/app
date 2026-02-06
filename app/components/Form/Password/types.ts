import type { InputHTMLAttributes, ReactNode } from "react"
import type { ClassValue } from "clsx"

export type PasswordProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  className?: ClassValue
  inputClassName?: ClassValue

  /** Show toggle button to reveal/hide password (default true) */
  showToggle?: boolean
  /** Optional label (rendered above input) */
  label?: ReactNode
  labelClassName?: ClassValue
  /** Optional description (below input) */
  description?: ReactNode
  descriptionClassName?: ClassValue
}
