import type { ComponentPropsWithoutRef, FC } from "react"
import { cn } from "@/lib/cn"

export type SectionContentProps = ComponentPropsWithoutRef<"div">

export const SectionContent: FC<SectionContentProps> = ({
  className,
  ...props
}) => <div className={cn("section-content", className)} {...props} />
