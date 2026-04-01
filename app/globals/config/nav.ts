export type NavLink = {
  readonly href: string
  readonly label: string
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/events", label: "Events" },
  { href: "/join", label: "Join" },
  { href: "/contact", label: "Contact" },
] as const

export const isNavActive = (pathname: string, href: string): boolean =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`)
