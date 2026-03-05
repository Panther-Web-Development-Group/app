import { FC } from "react"
import type { SectionTitleProps } from "./types"
import { Audiowide } from "next/font/google"
import { sectionVariants } from "./variants"
import { cn } from "@/lib/cn"

const audioWideFont = Audiowide({
  subsets: ["latin"],
  weight: "400",
})

export const SectionTitle: FC<SectionTitleProps> = ({
  as: Component = "h2",
  children,
  className,
  icon,
  ...props
}) => {
  const { title } = sectionVariants({ as: Component })
  return (
    <Component {...props} className={cn(audioWideFont.className, title(), className)}>
      {icon ? (
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex shrink-0 [&>svg]:size-[1em]">{icon}</span>
          {children}
        </span>
      ) : (
        children
      )}
    </Component>
  )
}