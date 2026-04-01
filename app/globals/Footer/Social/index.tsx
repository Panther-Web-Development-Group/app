import Link from "next/link"
import type { FC } from "react"
import { FaDiscord, FaInstagram, FaLinkedin } from "react-icons/fa6"

import { SOCIAL_LINKS } from "@/app/globals/config/social"

export const FooterSocial: FC = () => (
  <div className="footer-social" aria-label="Social links">
    <Link
      href={SOCIAL_LINKS.instagram}
      className="footer-social-link"
      aria-label="Instagram"
      target="_blank"
      rel="noopener noreferrer"
    >
      <FaInstagram aria-hidden />
    </Link>
    <Link
      href={SOCIAL_LINKS.discord}
      className="footer-social-link"
      aria-label="Discord"
      target="_blank"
      rel="noopener noreferrer"
    >
      <FaDiscord aria-hidden />
    </Link>
    <Link
      href={SOCIAL_LINKS.linkedin}
      className="footer-social-link"
      aria-label="LinkedIn"
      target="_blank"
      rel="noopener noreferrer"
    >
      <FaLinkedin aria-hidden />
    </Link>
  </div>
)
