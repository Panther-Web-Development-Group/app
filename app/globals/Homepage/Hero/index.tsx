import type { FC } from "react"

import { DEFAULT_HERO_SUBTITLE } from "./config"
import { HeroCTA } from "./CTA"
import { HeroLogo } from "./Logo"
import { HeroSubtitle } from "./Subtitle"
import { HeroTitle } from "./Title"

export { DEFAULT_HERO_SUBTITLE, DEFAULT_HERO_TITLE } from "./config"
export type { HeroCTAProps } from "./CTA"
export type { HeroTitleProps } from "./Title"
export { HeroCTA, HeroLogo, HeroSubtitle, HeroTitle }

export const HomepageHero: FC = () => (
  <section className="hero">
    <div className="hero-heading">
      <HeroLogo />
      <HeroTitle />
    </div>
    <HeroSubtitle>{DEFAULT_HERO_SUBTITLE}</HeroSubtitle>
    <HeroCTA />
  </section>
)
