import { FC } from "react"
import { LinkProps } from "./types"
import NextLink from "next/link"
import { cn } from "@/lib/cn"

export const Link: FC<LinkProps> = ({
  children,
  icon,
  iconClassName,
  ...props
}) => {
  return (
    <NextLink {...props}>
      {icon && <span className={cn("mr-2", iconClassName)}>{icon}</span>}
      {children}
    </NextLink>
  )
}