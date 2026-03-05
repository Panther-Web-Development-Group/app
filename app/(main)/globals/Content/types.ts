import {
  DetailedHTMLProps,
  PropsWithChildren,
  HTMLAttributes,
} from "react"

export type ContentVariant = "regular" | "grid" | "withSidebar"

export type ContentProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    variant?: ContentVariant
  }
