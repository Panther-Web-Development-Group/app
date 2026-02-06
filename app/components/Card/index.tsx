"use client"

import { FC, ReactNode } from "react"
import { cn } from "@/lib/cn"
import Link from "next/link"

export interface CardProps {
  title?: string
  body?: string
  image?: {
    src: string
    alt?: string
  }
  images?: Array<{
    src: string
    alt?: string
    caption?: string
  }>
  link?: {
    href: string
    label?: string
  }
  className?: string
  children?: ReactNode
}

export const Card: FC<CardProps> = ({
  title,
  body,
  image,
  images,
  link,
  className,
  children,
}) => {
  const allImages = images || (image ? [image] : [])

  const cardContent = (
    <div
      className={cn(
        "rounded-lg border border-(--pw-border) bg-background/10 overflow-hidden transition-all hover:border-accent/50 hover:shadow-sm",
        className
      )}
    >
      {/* Single image at top */}
      {image && !images && (
        <div className="relative w-full aspect-video bg-background/5 overflow-hidden">
          <img
            src={image.src}
            alt={image.alt || title || ""}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {title && (
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        )}

        {body && (
          <p className="text-sm leading-6 text-foreground/75">{body}</p>
        )}

        {children}

        {/* Multiple images grid */}
        {images && images.length > 0 && (
          <div className="grid gap-3 grid-cols-2 mt-4">
            {images.map((img, idx) => (
              <figure key={idx} className="space-y-1">
                <div className="relative w-full aspect-square bg-background/5 rounded-lg overflow-hidden">
                  <img
                    src={img.src}
                    alt={img.alt || ""}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {img.caption && (
                  <figcaption className="text-xs text-foreground/60">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}

        {link && (
          <div className="pt-2">
            <Link
              href={link.href}
              className="text-sm font-semibold text-foreground/80 underline hover:text-foreground transition-colors"
            >
              {link.label || "Learn more"}
            </Link>
          </div>
        )}
      </div>
    </div>
  )

  return cardContent
}

export type { CardProps }
export { CardGroup } from "./CardGroup"
export type { CardGroupProps, CardGroupItem } from "./CardGroup"
