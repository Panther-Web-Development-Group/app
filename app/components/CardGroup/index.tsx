import { FC } from "react"
import type { CardGroupProps } from "./types"
import { cardGroupVariants } from "./variants"
import { cn } from "@/lib/cn"

const CardGroupRoot: FC<CardGroupProps> = ({
  children,
  className,
  variant = "normal",
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn(cardGroupVariants({ variant }), className)}
    >
      {children}
    </div>
  )
}

export const CardGroup = CardGroupRoot
