import { FC } from "react"
import {
  DetailedHTMLProps,
  HTMLAttributes,
} from "react"
import { cn } from "@/lib/cn"

export type ExecutiveMemberRoleProps = DetailedHTMLProps<
  HTMLAttributes<HTMLParagraphElement>,
  HTMLParagraphElement
>

export const ExecutiveMemberRole: FC<ExecutiveMemberRoleProps> = ({
  className,
  ...props
}) => (
  <p
    className={cn("text-sm font-medium text-accent", className)}
    {...props}
  />
)
