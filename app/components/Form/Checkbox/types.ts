import { ReactNode } from "react"
import { ClassValue } from "clsx"
import { InputProps } from "../Input/types"

export type CheckboxProps = Omit<InputProps, "type" | "className" | "checked" | "defaultChecked"> & {
  /** Wrapper className */
  className?: ClassValue
  /** Optional label rendered next to the box */
  label?: ReactNode

  /** Controlled checked state */
  checked?: boolean
  /** Uncontrolled initial checked state */
  defaultChecked?: boolean

  /** Convenience callback fired when user toggles the checkbox */
  onCheckedChange?: (checked: boolean) => void

  /** ClassName applied to the underlying (visually hidden) input */
  inputClassName?: ClassValue
}