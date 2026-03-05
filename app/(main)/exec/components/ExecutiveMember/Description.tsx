import { FC } from "react"
import {
  DetailedHTMLProps,
  HTMLAttributes,
} from "react"
import { cn } from "@/lib/cn"

export type ExecutiveMemberDescriptionProps = DetailedHTMLProps<
  HTMLAttributes<HTMLParagraphElement>,
  HTMLParagraphElement
>

export const ExecutiveMemberDescription: FC<ExecutiveMemberDescriptionProps> = ({
  className,
  ...props
}) => (
  <p
    className={cn("text-sm text-muted-foreground line-clamp-3", className)}
    {...props}
  />
)
