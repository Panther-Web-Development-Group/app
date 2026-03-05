import { FC } from "react"
import {
  DetailedHTMLProps,
  HTMLAttributes,
} from "react"
import { cn } from "@/lib/cn"
import { ExecutiveMemberImage } from "./Image"
import { ExecutiveMemberName } from "./Name"
import { ExecutiveMemberRole } from "./Role"
import { ExecutiveMemberDescription } from "./Description"
import { ExecutiveMemberDetails } from "./Details"

export type ExecutiveMemberProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

const ExecutiveMemberRoot: FC<ExecutiveMemberProps> = ({
  className,
  ...props
}) => (
  <article
    className={cn(
      "flex flex-col gap-4 rounded-lg border border-foreground/10 bg-foreground/5 p-6 transition-colors hover:border-foreground/20 hover:bg-foreground/[0.07]",
      className
    )}
    {...props}
  />
)

export const ExecutiveMember = Object.assign(ExecutiveMemberRoot, {
  Image: ExecutiveMemberImage,
  Name: ExecutiveMemberName,
  Role: ExecutiveMemberRole,
  Description: ExecutiveMemberDescription,
  Details: ExecutiveMemberDetails,
})
