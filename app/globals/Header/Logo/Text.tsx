import type { FC, PropsWithChildren } from "react"
import { cn } from "@/lib/cn"

/** Visible wordmark next to the logo mark */
export const HeaderLogoText: FC<PropsWithChildren> = ({ children }) => (
  <span
    className={cn(
      "font-audiowide",
      "max-[20rem]:hidden",
      "text-base sm:text-lg md:text-xl lg:text-2xl",
      "tracking-tight"
    )}
  >
    {children ?? "PantherWeb"}
  </span>
)
