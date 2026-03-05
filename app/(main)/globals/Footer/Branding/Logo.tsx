"use client"

import { FC, PropsWithChildren } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/cn"
import { Audiowide } from "next/font/google"

const audiowide = Audiowide({
  weight: "400",
  subsets: ["latin"],
})

export const FooterLogo: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 text-lg font-bold uppercase tracking-wide transition-colors hover:text-accent",
        audiowide.className
      )}
    >
      <Image
        src="/logos/PantherWeb-2.png"
        alt=""
        width={40}
        height={40}
        className="shrink-0"
      />
      {children}
    </Link>
  )
}
