import { FC } from "react"
import type { SectionProps } from "./types"
import { sectionVariants } from "./variants"
import { SectionProvider } from "./Context"
import { cn } from "@/lib/cn"
import { SectionTitle } from "./Title"
import { SectionContent } from "./Content"

const SectionRoot: FC<SectionProps> = ({
  children,
  className,
  type = "full",
  ...props
}) => {
  const { root } = sectionVariants({ type })
  return (
    <SectionProvider type={type}>
      <section {...props} className={cn(root(), className)}>
        {children}
      </section>
    </SectionProvider>
  )
}

export const Section = Object.assign(SectionRoot, {
  Title: SectionTitle,
  Content: SectionContent
})