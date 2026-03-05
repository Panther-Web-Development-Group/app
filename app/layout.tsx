import type {
  FC,
  PropsWithChildren
} from "react"
import type { Metadata } from "next"
import { Exo } from "next/font/google"
import { cn } from "@/lib/cn"
import "./globals.css"

export const metadata: Metadata ={
  title: {
    default: "Panther Web Development Group",
    template: "%s | Panther Web Development Group"
  },
  description: "PantherWeb is a place to hone or grow your web development skills",
  keywords: [
    "Panther Web Development Group", 
    "Panther Web Development",
    "Panther Web Dev",
    "PantherWeb",
    "PWD",
    "Web Development"
  ]
}

const exoFont = Exo({
  subsets: ["latin"],
  variable: "--font-exo"
})

const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en" className={cn(
      "antialiased scroll-smooth snap-proximity snap-y min-h-screen",
      exoFont.variable
    )}>
      <body className="bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}

export default RootLayout