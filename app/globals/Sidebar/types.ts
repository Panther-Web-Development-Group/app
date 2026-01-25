import {
  HTMLAttributes,
  ReactNode,
  FormEventHandler,
} from "react"
import { ClassValue } from "clsx"

export type NavigationItem = {
  id: string
  label: string
  href?: string | null
  icon?: ReactNode
  image?: string | null
  is_external?: boolean
  target?: string
  order_index?: number
  children?: NavigationItem[] // Submenu items
}

export type SidebarProps = HTMLAttributes<HTMLElement> & {
  logo?: ReactNode
  searchbar?: ReactNode | false
  navigation?: ReactNode
}

export type SidebarLogoProps = HTMLAttributes<HTMLAnchorElement> & {
  src?: string
  alt?: string
  href?: string
}

export type SidebarSearchbarProps = HTMLAttributes<HTMLInputElement> & {
  placeholder?: string
  onSearch?: (query: string) => void
}

export type SidebarNavigationProps = HTMLAttributes<HTMLElement> & {
  items?: NavigationItem[]
}
