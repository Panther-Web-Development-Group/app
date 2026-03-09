import type { PropsWithChildren } from "react"

export type FooterProps = PropsWithChildren &
  React.HTMLAttributes<HTMLElement>

export type FooterContainerProps = PropsWithChildren &
  React.HTMLAttributes<HTMLDivElement>

export type FooterNavSectionProps = PropsWithChildren & {
  title: string
  className?: string
}

export type FooterNavItemProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
}
