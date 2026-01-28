import type { HTMLAttributes } from "react"
import type { ClassValue } from "clsx"

export type ColorPickerProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  className?: ClassValue

  name?: string
  disabled?: boolean

  /** Hex color, e.g. "#1f4f6c" */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void

  /** Optional name for palette hidden inputs */
  paletteName?: string
  paletteValue?: string[]
  defaultPaletteValue?: string[]
  onPaletteChange?: (palette: string[]) => void

  enablePalettes?: boolean
}

