import type { 
  DetailedHTMLProps,
  ButtonHTMLAttributes,
  ReactNode 
} from "react"
import type { ClassValue } from "clsx"
import type { LinkProps } from "../Link/types"

export type ButtonType = 
  | "button"
  | "submit"
  | "reset"

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link"
  | "icon"
  | "default"

export type ButtonSize =
  | "micro"
  | "tiny"
  | "mini"
  | "extra-small"
  | "small"
  | "medium"
  | "large"
  | "extra-large"
  | "huge"
  | "massive"
  | "default"

export type ButtonSizeWithAliases = ButtonSize | "xs" | "sm" | "md" | "lg" | "xl"

type TooltipSide = "top" | "bottom" | "left" | "right"

type CommonButtonProps = {
  icon?: ReactNode
  iconClassName?: ClassValue
  disabled?: boolean
  loading?: boolean
  loadingContent?: ReactNode
  loadingClassName?: ClassValue
  variant?: ButtonVariant
  size?: ButtonSizeWithAliases
  /** Tooltip shown on hover/focus */
  tooltip?: ReactNode
  /** Tooltip position (default "top") */
  tooltipSide?: TooltipSide
  children: ReactNode
}

export type ButtonProps = 
  | ({
      as?: "button"
      type?: ButtonType
    } & Omit<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "type" | "as"> & CommonButtonProps)
  | ({
      as: "link"
      href: string
    } & Omit<LinkProps, "as" | "href"> & CommonButtonProps)

    
// Helper type for button-only props (excludes link variant)
export type ButtonOnlyProps = Extract<ButtonProps, { as?: "button" }>

// Helper type for link-only props (excludes button variant)
export type ButtonLinkProps = Extract<ButtonProps, { as: "link" }>