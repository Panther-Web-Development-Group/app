import Link from "next/link"
import type { FC, ReactNode } from "react"

export type HomepageSectionProps = {
  title: string
  children: ReactNode
  cta?: { href: string; label: string }
}

export const HomepageSection: FC<HomepageSectionProps> = ({
  title,
  children,
  cta,
}) => (
  <section className="hs">
    <div className="hs-inner">
      <div className="hs-main">
        <h2 className="hs-title">{title}</h2>
        {children}
      </div>
      {cta ? (
        <div className="hs-actions">
          <Link href={cta.href} className="btn-section">
            {cta.label}
          </Link>
        </div>
      ) : null}
    </div>
  </section>
)
