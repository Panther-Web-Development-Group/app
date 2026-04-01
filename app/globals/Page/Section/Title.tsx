import type { ComponentPropsWithoutRef, FC } from "react"
import { cn } from "@/lib/cn"

export type SectionTitleProps = ComponentPropsWithoutRef<"h2">

export const SectionTitle: FC<SectionTitleProps> = ({
  children,
  className,
  ...props
}) => (
  <h2 className={cn("section-title", className)} {...props}>
    <span className="section-title__marker">&lt;</span>
    <span className="section-title__content">{children}</span>
    <span className="section-title__marker">/&gt;</span>
  </h2>
)