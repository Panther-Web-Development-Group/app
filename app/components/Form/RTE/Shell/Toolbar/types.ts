import type { 
  ReactNode,
  HTMLAttributes,
  DetailedHTMLProps,
  ButtonHTMLAttributes,
  PropsWithChildren,
} from "react"
import type {
  ToolbarItem
} from "../../types"

export type ShellToolbarProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & PropsWithChildren

export type ShellToolbarButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>, 
  HTMLButtonElement
> & {
  isActive?: boolean
  size?: "sm" | "md"
} & PropsWithChildren

export type ShellToolbarItemProps = ToolbarItem & PropsWithChildren & {
  align?: "left" | "right" | "center"
  /** Optional className for dropdown content (e.g. min-width for block menu) */
  contentClassName?: string
}
