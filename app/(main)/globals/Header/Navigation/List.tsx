"use client"
import {
  FC
} from "react"
import { NavigationListProps } from "./types"
import { cn } from "@/lib/cn"
import { useContainer } from "../../Container/Context"

export const NavigationList: FC<NavigationListProps> = ({ className, children, ...props }) => {
  const { navIsOpen } = useContainer()
  return (
    <ul {...props} className={cn("flex flex-col gap-1 w-full", className)}>
      {children}
    </ul>
  )
}