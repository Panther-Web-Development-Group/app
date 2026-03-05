import { FC } from "react"
import {
  DetailedHTMLProps,
  HTMLAttributes,
} from "react"
import { cn } from "@/lib/cn"

export type ExecutiveMemberNameProps = DetailedHTMLProps<
  HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
>

export const ExecutiveMemberName: FC<ExecutiveMemberNameProps> = ({
  className,
  ...props
}) => (
  <h3
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
)
