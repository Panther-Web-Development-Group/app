import {
  HTMLAttributes,
  ReactNode
} from "react"
import { ClassValue } from "clsx"

export type HeaderProps = HTMLAttributes<HTMLElement> & {
  logo?: ReactNode
  showSidebarToggle?: boolean
}

export type HeaderLogoProps = HTMLAttributes<HTMLAnchorElement> & {
  src?: string
  alt?: string
  href?: string
}

export type HeaderThemeChangerProps = HTMLAttributes<HTMLElement>