import type { FC } from "react"

import { FOOTER_BRAND_NAME, FOOTER_TAGLINE } from "../config/copy"

export type FooterCopyrightProps = {
  /** Defaults to the current calendar year when rendered */
  year?: number
}

export const FooterCopyright: FC<FooterCopyrightProps> = ({
  year = new Date().getFullYear(),
}) => (
  <span className="footer-copy footer-copy-full">
    &copy;{" "}
    <time dateTime={String(year)}>{year}</time> {FOOTER_BRAND_NAME} &mdash;{" "}
    {FOOTER_TAGLINE}
  </span>
)
