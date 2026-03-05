import {
  DetailedHTMLProps,
  PropsWithChildren,
  ButtonHTMLAttributes,
} from "react"

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"

export type ButtonSize = "sm" | "md" | "lg"

export type ButtonProps = PropsWithChildren &
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    variant?: ButtonVariant
    size?: ButtonSize
    fullWidth?: boolean
  }
