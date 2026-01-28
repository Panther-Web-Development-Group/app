import type { InputHTMLAttributes, ReactNode } from "react"
import type { ClassValue } from "clsx"

export type SwitchProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "checked" | "defaultChecked" | "onChange" | "className"
> & {
  /** Wrapper className */
  className?: ClassValue
  /** ClassName applied to the underlying input */
  inputClassName?: ClassValue

  label?: ReactNode

  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

