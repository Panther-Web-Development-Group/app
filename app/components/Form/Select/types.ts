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

  registerOption: (value: string, label: ReactNode, element: HTMLElement | null) => void
  unregisterOption: (value: string) => void
  getOptionLabel: (value: string) => ReactNode | undefined
  getOptionElement: (value: string) => HTMLElement | null | undefined
  getAllOptionValues: () => string[]

  focusedValue: string | null
  setFocusedValue: (value: string | null) => void

  triggerId: string
  listboxId: string
  
  labelsVersion: number
}

export type SelectTriggerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "onChange"
> & {
  className?: ClassValue
}

export type SelectContentProps = HTMLAttributes<HTMLDivElement> & {
  className?: ClassValue
  /** Positioning strategy: 'auto' (viewport-aware), 'bottom' (always below), 'top' (always above) */
  position?: "auto" | "bottom" | "top"
  /** Maximum height of the content dropdown */
  maxHeight?: number | string
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