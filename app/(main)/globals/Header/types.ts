import {
  DetailedHTMLProps,
  PropsWithChildren,
  HTMLAttributes,
  RefObject,
} from "react"

export type HeaderProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>, 
  HTMLElement
> & {
  ref?: RefObject<HTMLElement>
}

export type HeaderContainerProps = PropsWithChildren & DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

export type HeaderSearchProps = PropsWithChildren & DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
>