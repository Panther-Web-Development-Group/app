import type { FC, PropsWithChildren } from "react"

export const FooterInner: FC<PropsWithChildren> = ({ children }) => (
  <div className="footer-inner">{children}</div>
)
