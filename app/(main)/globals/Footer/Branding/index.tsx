"use client"

import { FC } from "react"
import { FooterLogo } from "./Logo"
import { ContactInfo } from "./ContactInfo"
import { SocialIcons } from "./SocialIcons"
import { cn } from "@/lib/cn"

export const FooterBranding: FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <FooterLogo>PantherWeb</FooterLogo>
      <ContactInfo />
      <SocialIcons />
    </div>
  )
}
