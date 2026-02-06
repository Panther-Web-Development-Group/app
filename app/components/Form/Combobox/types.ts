import type {
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react"
import type { ClassValue } from "clsx"

export type ComboboxProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  className?: ClassValue

  name?: string
  disabled?: boolean

  /** Controlled selected value */
  value?: string
  /** Uncontrolled initial selected value */
  defaultValue?: string
  onValueChange?: (value: string) => void

  /** Controlled query (typed text) */
  query?: string
  /** Uncontrolled initial query */
  defaultQuery?: string
  onQueryChange?: (query: string) => void

  placeholder?: ReactNode
  /** Clear query text after selecting an option (default: false) */
  clearOnSelect?: boolean

  /** Custom filter predicate (defaults to case-insensitive substring match) */
  filter?: (args: { query: string; optionValue: string; optionText: string }) => boolean
}

export type ComboboxContextValue = {
  name?: string
  disabled?: boolean

  open: boolean
  setOpen: (open: boolean) => void

  value?: string
  setValue: (next: string) => void

  query: string
  setQuery: (q: string) => void

  placeholder?: ReactNode
  clearOnSelect: boolean
  filter?: (args: { query: string; optionValue: string; optionText: string }) => boolean

  activeValue?: string
  setActiveValue: (v: string | undefined) => void

  registerOption: (value: string, data: { text: string; disabled?: boolean }, element: HTMLElement | null) => void
  unregisterOption: (value: string) => void
  getOptionText: (value: string) => string | undefined
  getOptionDisabled: (value: string) => boolean
  getOptionElement: (value: string) => HTMLElement | null | undefined
  getVisibleValues: () => string[]
  getOptionId: (value: string) => string

  inputId: string
  listboxId: string
}

export type ComboboxInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "disabled"
> & {
  className?: ClassValue
}

export type ComboboxContentProps = HTMLAttributes<HTMLDivElement> & {
  className?: ClassValue
  /** Positioning strategy: 'auto' (viewport-aware), 'bottom' (always below), 'top' (always above) */
  position?: "auto" | "bottom" | "top"
  /** Maximum height of the content dropdown */
  maxHeight?: number | string
}

export type ComboboxOptionProps = Omit<HTMLAttributes<HTMLDivElement>, "onClick"> & {
  className?: ClassValue
  value: string
  disabled?: boolean
  /** Used for filtering + display in the input when selected (defaults to children if string) */
  textValue?: string
  children: ReactNode
}

