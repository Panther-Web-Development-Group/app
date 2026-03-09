"use client"

import { FC } from "react"
import Image from "next/image"
import type { HeroSlideImageProps } from "./types"
import { cn } from "@/lib/cn"

export const HeroSlideImage: FC<HeroSlideImageProps> = ({
  alt,
  src,
  className,
  placeholder,
  ...props
}) => {
  return (
    <div className="absolute inset-0">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        className={cn("object-cover", className)}
        priority
        placeholder={placeholder}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-black/25"
        aria-hidden
      />
    </div>
  )
}
