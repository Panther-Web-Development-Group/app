import {
  DetailedHTMLProps,
  PropsWithChildren,
  HTMLAttributes,
} from "react"

export type CardGroupVariant = "normal" | "grid"

export type CardGroupProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    variant?: CardGroupVariant
  }
