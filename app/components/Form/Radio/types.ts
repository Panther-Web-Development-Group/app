import { ReactNode } from "react"
import { ClassValue } from "clsx"
import { InputProps } from "../Input/types"

export type RadioProps = Omit<InputProps, "type" | "className"> & {
  /** Wrapper className */
  className?: ClassValue
  /** Optional label rendered next to the circle */
  label?: ReactNode

  /** Convenience callback fired when user checks the radio */
  onCheckedChange?: (checked: boolean) => void

  /** ClassName applied to the underlying (visually hidden) input */
  inputClassName?: ClassValue
}

