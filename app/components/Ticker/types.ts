import {
  DetailedHTMLProps,
  PropsWithChildren,
  HTMLAttributes,
} from "react"

export type TickerDirection = "left" | "right"

export type TickerProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    speed?: number
    direction?: TickerDirection
    pauseOnHover?: boolean
  }

export type TickerItemProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
