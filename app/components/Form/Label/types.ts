import { LabelHTMLAttributes, ReactNode } from "react"
import { ClassValue } from "clsx"

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  icon?: ReactNode
  iconClassName?: ClassValue,
  name?: string
}