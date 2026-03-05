import { FC } from "react"
import {
  DetailedHTMLProps,
  HTMLAttributes,
} from "react"
import { cn } from "@/lib/cn"

export type ExecutiveMemberDetailsProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

export const ExecutiveMemberDetails: FC<ExecutiveMemberDetailsProps> = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col gap-1", className)}
    {...props}
  />
)
