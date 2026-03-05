import { FC } from "react"
import {
  DetailedHTMLProps,
  HTMLAttributes,
  PropsWithChildren,
} from "react"
import { cn } from "@/lib/cn"

export type ContentTitleProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  }

const sizeClasses: Record<NonNullable<ContentTitleProps["as"]>, string> = {
  h1: "text-2xl font-bold md:text-3xl",
  h2: "text-xl font-semibold md:text-2xl",
  h3: "text-lg font-semibold md:text-xl",
  h4: "text-base font-semibold md:text-lg",
  h5: "text-sm font-semibold md:text-base",
  h6: "text-sm font-medium md:text-base",
}

export const ContentTitle: FC<ContentTitleProps> = ({
  as: Component = "h2",
  children,
  className,
  ...props
}) => (
  <Component
    className={cn("text-foreground", sizeClasses[Component], className)}
    {...props}
  >
    {children}
  </Component>
)
