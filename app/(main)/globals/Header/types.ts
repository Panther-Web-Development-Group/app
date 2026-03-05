import {
  DetailedHTMLProps,
  PropsWithChildren,
  HTMLAttributes
} from "react"

export type HeaderProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>, 
  HTMLElement
> & {
  ref: RefObject<HTMLElement>
}

export type HeaderContainerProps = PropsWithChildren & DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
>

export type HeaderSearchProps = PropsWithChildren & DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
>