import type { FC, PropsWithChildren } from "react"

import { Footer } from "@/app/globals/Footer"
import { Header } from "@/app/globals/Header"
import { HomepageBackdrop } from "@/app/globals/Homepage/Backdrop"

const SiteLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <HomepageBackdrop />
      <Header />
      <div className="page">{children}</div>
      <Footer />
    </>
  )
}

export default SiteLayout
