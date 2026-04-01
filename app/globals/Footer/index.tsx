import type { FC } from "react"

import { FooterAffiliates } from "./Affiliates"
import { FooterBrand } from "./Brand"
import { FooterCopyright } from "./Copyright"
import { FooterInner } from "./Inner"
import { FooterNav } from "./Navigation"
import { FooterSocial } from "./Social"

export { FooterAffiliates } from "./Affiliates"
export { FooterBrand } from "./Brand"
export { FooterCopyright } from "./Copyright"
export type { FooterCopyrightProps } from "./Copyright"
export { FOOTER_BRAND_NAME, FOOTER_TAGLINE } from "./config/copy"
export {
  FOOTER_NAV_SECTIONS,
  type FooterNavSection,
} from "./config/footerNav"
export { FooterInner } from "./Inner"
export { FooterNav } from "./Navigation"
export { FooterSocial } from "./Social"

export const Footer: FC = () => (
  <footer className="footer">
    <FooterInner>
      <div className="footer-main">
        <div className="footer-main-left">
          <FooterBrand />
          <FooterSocial />
        </div>
        <FooterNav />
      </div>
      <FooterAffiliates />
      <FooterCopyright />
    </FooterInner>
  </footer>
)
