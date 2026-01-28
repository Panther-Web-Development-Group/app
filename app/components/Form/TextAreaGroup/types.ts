import { 
  TextareaHTMLAttributes, 
  ReactNode 
} from "react"
import { ClassValue } from "clsx"

export type DescriptionType = "text" | "tooltip"

export type TextAreaGroupProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
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
  textAreaClassName?: ClassValue,
  collapseOnBlur?: boolean // default: true
}