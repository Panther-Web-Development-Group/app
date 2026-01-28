import type { InputHTMLAttributes } from "react"
import type { ClassValue } from "clsx"

export type NumberInputSpinnerPosition = "right" | "top-bottom"

export type NumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "defaultValue" | "onChange" | "className"
> & {
  /** Wrapper className */
  className?: ClassValue
  /** ClassName applied to the underlying input */
  inputClassName?: ClassValue

  value?: number | null
  defaultValue?: number | null
  onValueChange?: (value: number | null) => void

  /** Position of the spinner buttons */
  spinnerPosition?: NumberInputSpinnerPosition
}

