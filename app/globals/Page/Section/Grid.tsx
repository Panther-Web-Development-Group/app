import type { ComponentPropsWithoutRef, FC } from "react"
import { cn } from "@/lib/cn"

export type SectionGridProps = ComponentPropsWithoutRef<"div">

export const SectionGrid: FC<SectionGridProps> = ({ className, ...props }) => (
  <div className={cn("section-grid", className)} {...props} />
)
