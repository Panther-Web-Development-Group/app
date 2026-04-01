import type { ComponentPropsWithoutRef, FC } from "react"
import { SectionCTA } from "./CTA"
import { SectionContent } from "./Content"
import { SectionGrid } from "./Grid"
import { SectionSubtitle } from "./Subtitle"
import { SectionTitle } from "./Title"
import { cn } from "@/lib/cn"

export type SectionProps = ComponentPropsWithoutRef<"section">

const SectionRoot: FC<SectionProps> = ({ className, children, ...props }) => (
  <section {...props} className={cn("section", className)}>
    {children}
  </section>
)

export const Section = Object.assign(SectionRoot, {
  CTA: SectionCTA,
  Content: SectionContent,
  Grid: SectionGrid,
  Subtitle: SectionSubtitle,
  Title: SectionTitle,
})