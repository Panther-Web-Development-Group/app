"use client"

import { FC } from "react"
import Link from "next/link"
import { 
  FaDiscord, 
  FaInstagram, 
  FaGithub, 
  FaLinkedin 
} from "react-icons/fa"
import { cn } from "@/lib/cn"

const socialLinks = [
  {
    href: "https://discord.gg/PAcfCYJrgk",
    icon: FaDiscord,
    label: "Discord",
  },
  {
    href: "https://www.instagram.com/pantherweb.gsu",
    icon: FaInstagram,
    label: "Instagram",
  },
  {
    href: "https://github.com/Panther-Web-Development-Group",
    icon: FaGithub,
    label: "GitHub",
  },
  {
    href: "https://www.linkedin.com/company/pantherweb-gsu/",
    icon: FaLinkedin,
    label: "LinkedIn",
  },
]

export const SocialIcons: FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {socialLinks.map(({ href, icon: Icon, label }) => (
        <Link
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex size-8 items-center justify-center rounded-full bg-foreground/10 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label={label}
        >
          <Icon className="size-4" />
        </Link>
      ))}
    </div>
  )
}
