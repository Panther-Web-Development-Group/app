import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"

import { FOOTER_BRAND_NAME } from "../config/copy"

export const FooterBrand: FC = () => (
  <Link href="/" className="footer-brand">
    <Image
      src="/logos/PantherWeb-1.png"
      alt=""
      width={56}
      height={56}
      className="footer-brand-logo"
    />
    <span className="footer-brand-text font-audiowide">{FOOTER_BRAND_NAME}</span>
  </Link>
)
