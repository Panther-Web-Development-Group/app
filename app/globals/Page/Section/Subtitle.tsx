import type { ComponentPropsWithoutRef, FC } from "react"
import { cn } from "@/lib/cn"

export type SectionSubtitleProps = ComponentPropsWithoutRef<"p">

export const SectionSubtitle: FC<SectionSubtitleProps> = ({
  className,
  ...props
}) => <p className={cn("section-subtitle", className)} {...props} />
