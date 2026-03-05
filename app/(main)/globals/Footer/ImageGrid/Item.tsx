"use client"

import { FC } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/cn"

export const FooterImageGridItem: FC<{
  src: string
  alt: string
  href?: string
  width?: number
  height?: number
  className?: string
}> = ({ src, alt, href, width = 48, height = 48, className }) => {
  const image = (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("rounded-lg object-contain opacity-80 transition-opacity hover:opacity-100", className)}
    />
  )

  if (href) {
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer" className="shrink-0">
        {image}
      </Link>
    )
  }

  return <div className="shrink-0">{image}</div>
}
