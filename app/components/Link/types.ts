import { 
  ReactNode,
  AnchorHTMLAttributes,
} from "react"
import { ClassValue } from "clsx"
import { LinkProps as NextLinkProps } from "next/link"

export type LinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof NextLinkProps
> & NextLinkProps & {
  icon?: ReactNode
  iconClassName?: ClassValue
}