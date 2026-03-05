"use client"
import {
  FC,
  PropsWithChildren
} from "react"
import { Logo } from "../Logo"
import { Navigation } from "../Navigation"
import { cn } from "@/lib/cn"

export type HeaderBrandProps = PropsWithChildren &
  React.HTMLAttributes<HTMLDivElement>

export const HeaderBrand: FC<HeaderBrandProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn("flex items-center justify-between gap-2 min-w-0", className)}
    >
      <Logo>{children}</Logo>
      <Navigation.Trigger />
    </div>
  )
}
