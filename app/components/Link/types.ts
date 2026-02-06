import { 
  ReactNode,
  DetailedHTMLProps,
  AnchorHTMLAttributes,
} from "react"
import { ClassValue } from "clsx"
import { LinkProps as NextLinkProps } from "next/link"

export type LinkProps = Omit<
  DetailedHTMLProps<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >,
  keyof NextLinkProps
> & NextLinkProps & {
  icon?: ReactNode
  iconClassName?: ClassValue
}