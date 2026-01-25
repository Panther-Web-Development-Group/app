import { HTMLAttributes, ReactNode } from "react"

export type FooterProps = HTMLAttributes<HTMLElement> & {
  /**
   * Footer sections (navigation links grouped by section)
   */
  sections?: ReactNode
  
  /**
   * Social links (icons/buttons)
   */
  socialLinks?: ReactNode
  
  /**
   * Copyright text or custom footer content
   */
  copyright?: ReactNode
  
  /**
   * Additional footer content
   */
  children?: ReactNode
}

export type FooterSectionProps = HTMLAttributes<HTMLElement> & {
  /**
   * Section title
   */
  title: ReactNode
  
  /**
   * Links in this section
   */
  children: ReactNode
}

export type FooterLinkProps = HTMLAttributes<HTMLAnchorElement> & {
  /**
   * Link text
   */
  label: ReactNode
  
  /**
   * Link URL
   */
  href: string
  
  /**
   * Whether link is external
   */
  isExternal?: boolean
  
  /**
   * Link target
   */
  target?: string
  
  /**
   * Optional icon
   */
  icon?: ReactNode
}

export type SocialLinkProps = HTMLAttributes<HTMLAnchorElement> & {
  /**
   * Platform name (e.g., "GitHub", "Twitter")
   */
  platform: string
  
  /**
   * Link URL
   */
  href: string
  
  /**
   * Optional icon
   */
  icon?: ReactNode
  
  /**
   * Optional image URL
   */
  image?: string
  
  /**
   * Accessible label
   */
  "aria-label"?: string
}
