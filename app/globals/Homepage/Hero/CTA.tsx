import Link from "next/link"
import type { FC, PropsWithChildren } from "react"

export type HeroCTAProps = PropsWithChildren<{
  href?: string
}>

export const HeroCTA: FC<HeroCTAProps> = ({
  href = "/join",
  children = (
    <>
      Join Us Today &rarr;
    </>
  ),
}) => (
  <div className="hero-btns">
    <Link href={href} className="btn">
      {children}
    </Link>
  </div>
)
