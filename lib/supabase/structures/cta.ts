import type { ReactNode } from "react"

/**
 * CTA button variant types.
 */
export type CTAVariant = "primary" | "secondary" | "outline" | "ghost" | "link"

/**
 * CTA button size types.
 */
export type CTASize = "sm" | "md" | "lg"

/**
 * CTA button structure.
 */
export interface CTAButton {
  label: string
  url: string
  variant?: CTAVariant
  size?: CTASize
  icon?: ReactNode
  open_in_new_tab?: boolean
  disabled?: boolean
}

/**
 * CTA group structure for multiple buttons.
 */
export interface CTAGroup {
  primary?: CTAButton
  secondary?: CTAButton
  alignment?: "left" | "center" | "right"
  spacing?: "sm" | "md" | "lg"
}
