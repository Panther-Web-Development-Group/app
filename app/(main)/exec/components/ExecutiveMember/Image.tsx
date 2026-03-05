"use client"

import { FC } from "react"
import Image from "next/image"
import {
  DetailedHTMLProps,
  HTMLAttributes,
} from "react"
import { cn } from "@/lib/cn"

export type ExecutiveMemberImageProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  src: string
  alt: string
  width?: number
  height?: number
}

export const ExecutiveMemberImage: FC<ExecutiveMemberImageProps> = ({
  src,
  alt,
  width = 320,
  height = 320,
  className,
  ...props
}) => (
  <div
    {...props}
    className={cn(
      "relative aspect-square w-full overflow-hidden rounded-lg bg-foreground/5",
      className
    )}
  >
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="size-full object-cover"
    />
  </div>
)
