import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"

import { AFFILIATE_ITEMS } from "../config/affiliates"

export const FooterAffiliates: FC = () => (
  <section className="footer-affiliates" aria-labelledby="footer-affiliates-title">
    <h2 id="footer-affiliates-title" className="footer-affiliates-title">
      Affiliates
    </h2>
    <ul className="footer-affiliates-grid">
      {AFFILIATE_ITEMS.map((item, i) => (
        <li key={`affiliate-${i}`}>
          <Link href={item.href} className="footer-affiliate-card">
            <Image
              src={item.imageSrc}
              alt=""
              width={120}
              height={120}
              className="footer-affiliate-img"
            />
            <span className="footer-affiliate-label">{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  </section>
)
