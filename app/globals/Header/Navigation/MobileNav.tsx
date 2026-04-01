import Link from "next/link"
import type { FC } from "react"

import type { NavLink } from "@/app/globals/config/nav"

export type MobileNavProps = {
  open: boolean
  links: readonly NavLink[]
  isActive: (href: string) => boolean
  onNavigate: () => void
}

export const MobileNav: FC<MobileNavProps> = ({
  open,
  links,
  isActive,
  onNavigate,
}) => (
  <div
    id="mobile-menu"
    className={`mobile-menu${open ? " open" : ""}`}
    role="dialog"
    aria-label="Mobile navigation"
  >
    {links.map(({ href, label }) => (
      <Link
        key={href}
        href={href}
        className={isActive(href) ? "active" : ""}
        onClick={onNavigate}
      >
        {label}
      </Link>
    ))}
  </div>
)
