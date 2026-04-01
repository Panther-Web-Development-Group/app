import type { FC } from "react"

import type { NavLink } from "@/app/globals/config/nav"
import { NavItem } from "./NavItem"

export type DesktopNavProps = {
  links: readonly NavLink[]
  isActive: (href: string) => boolean
}

export const DesktopNav: FC<DesktopNavProps> = ({ links, isActive }) => (
  <ul className="navbar-links">
    {links.map(({ href, label }) => (
      <NavItem key={href} href={href} label={label} active={isActive(href)} />
    ))}
  </ul>
)
