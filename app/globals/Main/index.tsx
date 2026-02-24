import { type FC } from "react"
import type { MainProps } from "./types"
import { cn } from "@/lib/cn"

export const Main: FC<MainProps> = ({
  children,
  container = "default",
  padded = true,
  className,
  ...props
}) => {
  const containerClasses = {
    full: "max-w-full",
    wide: "max-w-7xl",
    default: "max-w-5xl",
    narrow: "max-w-3xl",
  }

  return (
    <main
      className={cn(
        "flex-1",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "mx-auto w-full",
          containerClasses[container],
          padded && "px-4 pt-4 pb-6 sm:px-6 sm:pt-6 lg:px-8"
        )}
      >
        {children}
      </div>
    </main>
  )
}
