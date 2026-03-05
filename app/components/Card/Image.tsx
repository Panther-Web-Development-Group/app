"use client"

import { FC } from "react"
import Image from "next/image"
import type { CardImageProps, CardImagePosition } from "./types"
import { cardSlotVariants } from "./variants"
import { cn } from "@/lib/cn"

export const CardImage: FC<CardImageProps> = ({
  src,
  alt,
  width = 400,
  height = 300,
  position = "top",
  className,
  ...props
}) => {
  const { image } = cardSlotVariants()

  const positionClasses: Record<CardImagePosition, string> = {
    top: "aspect-[4/3] w-full shrink-0",
    bottom: "aspect-video w-full order-last",
    left: "aspect-square w-full md:w-1/3 md:shrink-0",
    right: "aspect-square w-full md:w-1/3 md:shrink-0 md:order-last",
    center: "aspect-video w-full mx-auto max-w-md",
    wide: "aspect-[21/9] w-full",
  }

  return (
    <div
      {...props}
      className={cn(image(), positionClasses[position], className)}
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
}
