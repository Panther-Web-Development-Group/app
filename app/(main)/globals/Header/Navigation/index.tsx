"use client"
import {
  FC,
  PropsWithChildren
} from "react"
import { NavigationProps } from "./types"
import { cn } from "@/lib/cn"
import { NavigationItem } from "./Item"
import { NavigationLink } from "./Link"
import { NavigationTrigger } from "./Trigger"
import { NavigationContent } from "./Content"
import { NavigationSubnav } from "./Subnav"
import { NavigationList } from "./List"

const NavigationRoot: FC<NavigationProps> = ({ className, children, ...props }) => {
  return (
    <nav {...props} className={cn("flex items-center gap-4", className)}>
      {children}
    </nav>
  )
}

export const Navigation = Object.assign(NavigationRoot, {
  Item: NavigationItem,
  Link: NavigationLink,
  Trigger: NavigationTrigger,
  Content: NavigationContent,
  Subnav: NavigationSubnav,
  List: NavigationList
})