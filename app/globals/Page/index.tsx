import type { PageProps } from "./types"
import { cn } from "@/lib/cn"
import { PageProvider } from "./Context"

/**
 * Page component - Server Component
 * Provides the main page wrapper with context for sidebar state
 */
export const Page = ({
  children,
  className,
  ...props
}: PageProps) => {
  const { id, ...rest } = props

  return (
    <PageProvider>
      <div
        id={id ?? "top"}
        className={cn(
          "flex min-h-screen flex-col",
          className
        )}
        {...rest}>
        {children}
      </div>
    </PageProvider>
  )
}
