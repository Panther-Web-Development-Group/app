import { FC, ReactNode } from "react"
import { cn } from "@/lib/cn"

export type ExecutiveCategoryProps = {
  title: string
  children: ReactNode
  className?: string
}

export const ExecutiveCategory: FC<ExecutiveCategoryProps> = ({
  title,
  children,
  className,
}) => (
  <section className={cn("flex flex-col gap-6", className)}>
    <h2 className="text-xl font-semibold text-foreground border-b border-foreground/10 pb-2">
      {title}
    </h2>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  </section>
)
