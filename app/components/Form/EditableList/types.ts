import type { HTMLAttributes } from "react"
import type { ClassValue } from "clsx"

export type EditableListProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  className?: ClassValue

  /** Name applied to each input so forms can `formData.getAll(name)` */
  name: string

  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void

  placeholder?: string
  addLabel?: string
  disabled?: boolean
}

