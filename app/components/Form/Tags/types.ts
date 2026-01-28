import type { HTMLAttributes } from "react"
import type { ClassValue } from "clsx"

export type TagsProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  className?: ClassValue

  /** Name applied to each hidden input so forms can `formData.getAll(name)` */
  name?: string
  disabled?: boolean

  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void

  placeholder?: string
  allowDuplicates?: boolean
  max?: number
  normalize?: (tag: string) => string
}

