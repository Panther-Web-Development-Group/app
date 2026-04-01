import type { Metadata } from "next"
import Link from "next/link"
import type { FC } from "react"

import { SOCIAL_LINKS } from "@/app/globals/config/social"

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach PantherWeb by email or community channels.",
}

const ContactPage: FC = () => {
  return (
    <div className="content">
      <h1 className="page-title">Contact</h1>
      <p className="hs-text">
        For general questions, partnerships, or speaking requests, email us and
        we will get back as soon as we can.
      </p>
      <p className="hs-text contact-page-gap">
        <a href={SOCIAL_LINKS.email} className="inline-link">
          pantherweb@gsu.edu
        </a>
      </p>
      <p className="hs-text contact-page-gap-wide">
        Prefer chat? Find us on{" "}
        <Link
          href={SOCIAL_LINKS.discord}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-link"
        >
          Discord
        </Link>{" "}
        or follow updates on{" "}
        <Link
          href={SOCIAL_LINKS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-link"
        >
          Instagram
        </Link>
        .
      </p>
    </div>
  )
}

export default ContactPage
