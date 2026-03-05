"use client"
import { 
  FC,
  PropsWithChildren
} from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/cn"
import { Audiowide } from "next/font/google"

const audiowide = Audiowide({
  weight: "400",
  subsets: ["latin"],
})

export const Logo: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Link href="/" className={cn("flex items-center gap-2 uppercase", audiowide.className)}>
      <Image src="/logos/PantherWeb-2.png" alt="Logo" width={60} height={60} />
      {children}
    </Link>
  )
}