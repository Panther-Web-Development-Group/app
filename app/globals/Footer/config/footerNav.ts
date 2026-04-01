import type { NavLink } from "@/app/globals/config/nav"

export type FooterNavSection = {
  readonly title: string
  readonly links: readonly NavLink[]
}

/** Grouped footer links; first section is Quick links. */
export const FOOTER_NAV_SECTIONS: readonly FooterNavSection[] = [
  {
    title: "Quick links",
    links: [
      { href: "/", label: "Home" },
      { href: "/events", label: "Events" },
      { href: "/join", label: "Join" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "About us",
    links: [
      { href: "/about", label: "About" },
      { href: "/team", label: "Team" },
    ],
  },
] as const
