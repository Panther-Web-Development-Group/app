"use client"
import {
  FC
} from "react"
import { NavigationItemProps } from "./types"
import { cn } from "@/lib/cn"
import { useContainer } from "../../Container/Context"
import { NavigationLink } from "./Link"
import { NavigationSubnav } from "./Subnav"

export const NavigationItem: FC<NavigationItemProps> = ({ className, children, href, subnav, onClick, ...props }) => {
  const { setNavIsOpen } = useContainer()

  return (
    <li {...props} className={cn("list-none", className)}>
      {href ? (
        <NavigationLink
          aria-haspopup={subnav ? "menu" : undefined}
          href={href!}
          onClick={(e) => {
            setNavIsOpen(false)
            onClick?.(e as React.MouseEvent<HTMLLIElement>)
          }}
        >
          {children}
        </NavigationLink>
      ) : (
        <span className="block px-3 py-2 text-sm font-medium text-foreground/60">
          {children}
        </span>
      )}
      {subnav && (
        <NavigationSubnav>
          {subnav}
        </NavigationSubnav>
      )}
    </li>
  )
}