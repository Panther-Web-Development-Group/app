import Image from "next/image"
import type { FC } from "react"

export const HeroLogo: FC = () => (
  <div className="hero-logo-wrap">
    <Image
      src="/logos/PantherWeb-1.png"
      alt="PantherWeb"
      width={400}
      height={208}
      className="hero-logo"
      priority
    />
  </div>
)
