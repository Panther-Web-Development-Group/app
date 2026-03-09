import {
  DetailedHTMLProps,
  PropsWithChildren,
  HTMLAttributes,
} from "react"

export type CardVariant =
  | "default"
  | "compact"
  | "full"
  | "elevated"
  | "wide"

export type CardSize =
  | "small"
  | "medium"
  | "large"
  | "xlarge"
  | "xxlarge"

export type CardDirection =
  | "horizontal"
  | "vertical"

export type CardProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    variant?: CardVariant
    size?: CardSize
    direction?: CardDirection
  }

export type CardContentProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export type CardImagePosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "center"
  | "wide"

export type CardImageProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    src: string
    alt: string
    width?: number
    height?: number
    position?: CardImagePosition
  }

export type CardImageContentProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    src: string
    alt: string
    width?: number
    height?: number
    position?: CardImagePosition
  }

export type CardListItemProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLLIElement>, HTMLLIElement> & {
    icon?: React.ReactNode
    title: string
    description: string
    href?: string
  }

export type CardListProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement>

export type CardLinkProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> & {
    href: string
    target?: string
    rel?: string
  }

export type CardButtonProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    onClick: () => void
  }

export type CardFooterProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export type CardHeaderProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export type CardTitleProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & {
    as?: React.ElementType
  }

export type CardDescriptionProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>

export type CardBadgeProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export type CardTagProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
  
export type CardTagItemProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    label: string
    color?: string
  }

export type CardTagListProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>