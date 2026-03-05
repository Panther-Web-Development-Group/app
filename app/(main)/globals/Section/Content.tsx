import { FC } from "react"
import type { SectionContentProps } from "./types"
import { sectionVariants } from "./variants"
import { useSection } from "./Context"
import { cn } from "@/lib/cn"

export const SectionContent: FC<SectionContentProps> = ({
  children,
  className,
  type: typeProp,
  ...props
}) => {
  const contextType = useSection()
  const type = typeProp ?? contextType ?? "full"
  const { content } = sectionVariants({ type })
  return (
    <div className={cn(content(), className)} {...props}>
      {children}
    </div>
  )
}