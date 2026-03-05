import { FC } from "react"
import {
  DetailedHTMLProps,
  HTMLAttributes,
  PropsWithChildren,
} from "react"
import { cn } from "@/lib/cn"

export type ContentSubtitleProps = PropsWithChildren &
  DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>

export const ContentSubtitle: FC<ContentSubtitleProps> = ({
  children,
  className,
  ...props
}) => (
  <p
    className={cn(
      "text-lg text-foreground/90 md:text-xl",
      className
    )}
    {...props}
  >
    {children}
  </p>
)
