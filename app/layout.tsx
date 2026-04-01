import type { Metadata, Viewport } from "next"
import { Sansation, Silkscreen, Audiowide, Fira_Code } from "next/font/google"
import type { FC, PropsWithChildren } from "react"
import { ThemeColorMeta } from "@/app/globals/ThemeColorMeta"
import { cn } from "@/lib/cn"
import "./globals.css"

const sansation = Sansation({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-sansation",
})

const silkscreen = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-silkscreen"
})

const audiowide = Audiowide({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-audiowide"
})

const firaCode = Fira_Code({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "PantherWeb | Web Development Club",
    template: "%s | PantherWeb",
  },
  description:
    "PantherWeb is the on-campus web development club — workshops, hackathons, and real projects from HTML to full-stack.",
}

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0c" },
  ],
}

const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en">
      <body
        className={cn(sansation.className, silkscreen.variable, audiowide.variable, firaCode.variable, "antialiased")}
      >
        <ThemeColorMeta />
        {children}
      </body>
    </html>
  )
}

export default RootLayout
