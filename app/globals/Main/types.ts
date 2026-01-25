import { HTMLAttributes, ReactNode } from "react"

export type MainProps = HTMLAttributes<HTMLElement> & {
  /**
   * Main content area
   */
  children: ReactNode
  
  /**
   * Container width variant
   */
  container?: "full" | "wide" | "default" | "narrow"
  
  /**
   * Whether to show padding
   */
  padded?: boolean
}
