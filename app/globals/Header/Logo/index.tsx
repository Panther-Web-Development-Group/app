import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"

import { HeaderLogoText } from "./Text"

export const HeaderLogo: FC = () => (
  <Link href="/" className="navbar-brand">
    <Image
      src="/logos/PantherWeb-1.png"
      alt=""
      width={320}
      height={128}
      className="navbar-logo"
      priority
    />
    <HeaderLogoText />
  </Link>
)
