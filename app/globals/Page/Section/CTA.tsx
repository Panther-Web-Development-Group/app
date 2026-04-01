import type { ComponentPropsWithoutRef, FC } from "react"
import { cn } from "@/lib/cn"

export type SectionCTAProps = ComponentPropsWithoutRef<"a">

export const SectionCTA: FC<SectionCTAProps> = ({ className, ...props }) => (
  <a className={cn("btn", "section-cta", className)} {...props} />
)
