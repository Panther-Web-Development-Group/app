"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { FC } from "react"

import { isNavActive } from "@/app/globals/config/nav"

import { FOOTER_NAV_SECTIONS } from "../config/footerNav"

export const FooterNav: FC = () => {
  const pathname = usePathname()

  return (
    <nav className="footer-nav" aria-label="Footer navigation">
      <div className="footer-nav-columns">
        {FOOTER_NAV_SECTIONS.map((section) => (
          <div key={section.title} className="footer-nav-section">
            <h3 className="footer-nav-heading">{section.title}</h3>
            <ul className="footer-nav-section-list">
              {section.links.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={
                      isNavActive(pathname, href) ? "active" : undefined
                    }
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}
