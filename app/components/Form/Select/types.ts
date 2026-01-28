import {
  HTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react"
import { ClassValue } from "clsx"

export type SelectShowMultipleType =
  | "collapsed"
  | "overflow"
  | "expanded"
  | "always"

export type SelectProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  className?: ClassValue

  name?: string
  disabled?: boolean

  multiple?: boolean
  showMultiple?: SelectShowMultipleType
  placeholder?: ReactNode

  /** Controlled value */
  value?: string | string[]
  /** Uncontrolled initial value */
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
}

export type SelectContextValue = {
  name?: string
  disabled?: boolean

  multiple: boolean
  showMultiple: SelectShowMultipleType
  placeholder?: ReactNode

  open: boolean
  setOpen: (open: boolean) => void

  value: string | string[] | undefined
  setValue: (next: string | string[]) => void

  registerOption: (value: string, label: ReactNode) => void
  unregisterOption: (value: string) => void
  getOptionLabel: (value: string) => ReactNode | undefined

  triggerId: string
  listboxId: string
}

export type SelectTriggerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "onChange"
> & {
  className?: ClassValue
}

export type SelectContentProps = HTMLAttributes<HTMLDivElement> & {
  className?: ClassValue
}

export type SelectOptionProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "value"> & {
  className?: ClassValue
  value: string
  disabled?: boolean
  /** Label used for the trigger display (defaults to children) */
  label?: ReactNode
}

export type SelectGroupProps = HTMLAttributes<HTMLDivElement> & {
  className?: ClassValue
  label?: ReactNode
}