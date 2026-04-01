import Link from "next/link"
import type { FC } from "react"

export type NavItemProps = {
  href: string
  label: string
  active: boolean
}

export const NavItem: FC<NavItemProps> = ({ href, label, active }) => (
  <li>
    <Link href={href} className={active ? "active" : ""}>
      {label}
    </Link>
  </li>
)
