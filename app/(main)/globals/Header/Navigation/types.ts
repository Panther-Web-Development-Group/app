import { 
  DetailedHTMLProps,
  PropsWithChildren,
  HTMLAttributes,
  AnchorHTMLAttributes,
  MouseEventHandler
} from "react"

export type NavigationProps = PropsWithChildren & DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
>

export type NavigationListProps = PropsWithChildren & DetailedHTMLProps<
  HTMLAttributes<HTMLUListElement>,
  HTMLUListElement
>

export type NavigationItemProps = DetailedHTMLProps<
  HTMLAttributes<HTMLLIElement>,
  HTMLLIElement
> & {
  href?: string
  subnav?: React.ReactNode
  onClick?: MouseEventHandler<HTMLLIElement>
}

export type NavigationLinkProps = DetailedHTMLProps<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>

export type NavigationTriggerProps = DetailedHTMLProps<
  HTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

export type NavigationContentProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  search?: React.ReactNode
  brand?: React.ReactNode
}

export type NavigationSubnavProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
>