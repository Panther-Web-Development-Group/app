import {
  DetailedHTMLProps,
  PropsWithChildren,
  HTMLAttributes,
} from "react"
import type { SectionType } from "./Context"

export type SectionProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
    type?: SectionType
  }

export type SectionTitleProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    icon?: React.ReactNode
  }

export type SectionContentProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    type?: SectionType
  } 