import Link from "next/link"
import type { FC } from "react"
import { FaDiscord, FaInstagram, FaLinkedin } from "react-icons/fa"
import { HiOutlineAcademicCap } from "react-icons/hi2"
import { MdOutlineEmail } from "react-icons/md"
import { cn } from "@/lib/cn"

import { SOCIAL_LINKS } from "@/app/globals/config/social"

const items = [
  {
    href: SOCIAL_LINKS.discord,
    label: "Discord",
    Icon: FaDiscord,
    external: true,
  },
  {
    href: SOCIAL_LINKS.instagram,
    label: "Instagram",
    Icon: FaInstagram,
    external: true,
  },
  {
    href: SOCIAL_LINKS.linkedin,
    label: "LinkedIn",
    Icon: FaLinkedin,
    external: true,
  },
  {
    href: SOCIAL_LINKS.email,
    label: "Email",
    Icon: MdOutlineEmail,
    external: false,
  },
  {
    href: SOCIAL_LINKS.pin,
    label: "Panther Involvement Network",
    Icon: HiOutlineAcademicCap,
    external: true,
  },
] as const

export const HomepageConnectSocialGrid: FC = () => (
  <ul className="hs-connect-grid">
    {items.map(({ href, label, Icon, external }) => (
      <li key={href} className={cn("h-full")}>
        <Link
          href={href}
          className={cn("hs-connect-card", "h-full")}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          <Icon className="hs-connect-card-icon" aria-hidden />
          <span className="hs-connect-card-label">{label}</span>
        </Link>
      </li>
    ))}
  </ul>
)
