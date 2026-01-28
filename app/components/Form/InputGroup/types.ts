import { 
  InputHTMLAttributes, 
  ReactNode 
} from "react"
import { ClassValue } from "clsx"

export type DescriptionType = "text" | "tooltip"

export type InputGroupProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: ClassValue,
  label?: ReactNode,
  labelClassName?: ClassValue,
  labelIcon?: ReactNode,
  labelIconClassName?: ClassValue,
  labelName?: string,
  /** Show a visual required indicator when `required` is true (default: true). */
  showRequired?: boolean,
  description?: ReactNode,
  descriptionClassName?: ClassValue,
  descriptionType?: DescriptionType,
  icon?: ReactNode,
  iconClassName?: ClassValue,
  inputClassName?: ClassValue,
  collapseOnBlur?: boolean // default: true
}