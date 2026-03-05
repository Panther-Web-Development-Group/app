import { FC } from "react"
import {
  DetailedHTMLProps,
  HTMLAttributes,
  PropsWithChildren,
} from "react"
import { cn } from "@/lib/cn"

export type ContentDescriptionProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>

export const ContentDescription: FC<ContentDescriptionProps> = ({
  children,
  className,
  ...props
}) => (
  <p
    className={cn(
      "text-muted-foreground",
      className
    )}
    {...props}
  >
    {children}
  </p>
)
