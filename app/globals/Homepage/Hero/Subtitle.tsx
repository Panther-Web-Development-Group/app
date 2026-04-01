import type { FC, PropsWithChildren } from "react"

export const HeroSubtitle: FC<PropsWithChildren> = ({ children }) => (
  <p className="hero-sub">{children}</p>
)
