"use client"

import { FC } from "react"
import { cn } from "@/lib/cn"
import Link from "next/link"

export interface GalleryItem {
  id: string
  media_asset: {
    id: string
    file_url: string
    filename: string
    alt_text?: string | null
    asset_type: "image" | "video" | "audio" | "document" | "other"
  }
  caption?: string | null
  link_href?: string | null
  order_index: number
}

export interface GalleryProps {
  title?: string
  description?: string
  items: GalleryItem[]
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export const Gallery: FC<GalleryProps> = ({
  title,
  description,
  items,
  columns = 3,
  className,
}) => {
  const sortedItems = [...items].sort((a, b) => a.order_index - b.order_index)

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }

  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {description && (
            <p className="mt-2 text-sm text-foreground/75">{description}</p>
          )}
        </div>
      )}

      {sortedItems.length === 0 ? (
        <div className="rounded-lg border border-(--pw-border) bg-background/10 p-12 text-center">
          <p className="text-sm text-foreground/75">No items in this gallery.</p>
        </div>
      ) : (
        <div className={cn("grid gap-4", gridCols[columns])}>
          {sortedItems.map((item) => {
            const isImage = item.media_asset.asset_type === "image"
            const isVideo = item.media_asset.asset_type === "video"
            const isAudio = item.media_asset.asset_type === "audio"

            const content = (
              <figure className="group relative space-y-2 rounded-lg border border-(--pw-border) bg-background/10 overflow-hidden transition-all hover:border-accent/50 hover:shadow-sm">
                {isImage ? (
                  <div className="relative w-full aspect-square bg-background/5 overflow-hidden">
                    <img
                      src={item.media_asset.file_url}
                      alt={item.media_asset.alt_text || item.caption || item.media_asset.filename}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : isVideo ? (
                  <div className="relative w-full aspect-video bg-background/5 flex items-center justify-center">
                    <video
                      src={item.media_asset.file_url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  </div>
                ) : isAudio ? (
                  <div className="relative w-full aspect-square bg-background/5 flex items-center justify-center p-4">
                    <div className="flex flex-col items-center gap-2 text-foreground/50">
                      <svg
                        className="w-12 h-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full aspect-square bg-background/5 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-accent/20 text-accent">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {item.caption && (
                  <figcaption className="px-3 pb-3 text-sm text-foreground/70">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            )

            if (item.link_href) {
              return (
                <Link key={item.id} href={item.link_href} className="block">
                  {content}
                </Link>
              )
            }

            return <div key={item.id}>{content}</div>
          })}
        </div>
      )}
    </div>
  )
}
