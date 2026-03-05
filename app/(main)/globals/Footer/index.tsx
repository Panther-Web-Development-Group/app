"use client"

import { FC } from "react"
import { FooterContainer } from "./Container"
import { FooterBranding } from "./Branding"
import { FooterNavigation } from "./Navigation"
import { Copyright as FooterCopyright } from "./Copyright"
import { FooterImageGrid } from "./ImageGrid"
import type { FooterProps } from "./types"
import { cn } from "@/lib/cn"

export const Footer: FC<FooterProps> = ({ className, ...props }) => {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      {...props}
      className={cn(
        "border-t border-border bg-foreground/5 py-12 md:py-16",
        className
      )}
    >
      <FooterContainer>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <FooterBranding />

          <FooterNavigation>
            <FooterNavigation.Section title="Quick links">
              <FooterNavigation.Item href="/">Home</FooterNavigation.Item>
              <FooterNavigation.Item href="/about">About</FooterNavigation.Item>
              <FooterNavigation.Item href="/exec">Exec</FooterNavigation.Item>
              <FooterNavigation.Item href="/about/team">Team</FooterNavigation.Item>
              <FooterNavigation.Item href="/about/history">History</FooterNavigation.Item>
              <FooterNavigation.Item href="/contact">Contact</FooterNavigation.Item>
            </FooterNavigation.Section>
          </FooterNavigation>
        </div>

        <div className="mt-12 flex flex-col-reverse gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <FooterCopyright
            holder="PantherWeb"
            additional="Georgia State University"
          />
          <FooterImageGrid>
            <FooterImageGrid.Item
              src="/logos/PantherWeb-1.png"
              alt="PantherWeb"
            />
            <FooterImageGrid.Item
              src="/logos/PantherWeb-2.png"
              alt="PantherWeb"
            />
            <FooterImageGrid.Item
              src="/logos/PantherWeb-3.png"
              alt="PantherWeb"
            />
          </FooterImageGrid>
        </div>
      </FooterContainer>
    </footer>
  )
}
