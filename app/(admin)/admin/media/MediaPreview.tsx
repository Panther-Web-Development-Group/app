"use client"

import { useState } from "react"

interface MediaPreviewProps {
  fileUrl: string
  filename: string
  assetType: "image" | "video" | "audio"
}

export function MediaPreview({ fileUrl, filename, assetType }: MediaPreviewProps) {
  const [imageError, setImageError] = useState(false)

  if (assetType === "image") {
    return (
      <div className="relative w-20 h-20 rounded-lg border border-(--pw-border) bg-background/10 overflow-hidden">
        {!imageError ? (
          <img
            src={fileUrl}
            alt={filename}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-foreground/50">
            No preview
          </div>
        )}
      </div>
    )
  }

  if (assetType === "video") {
    return (
      <div className="relative w-20 h-20 rounded-lg border border-(--pw-border) bg-background/10 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-foreground/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className="relative w-20 h-20 rounded-lg border border-(--pw-border) bg-background/10 flex items-center justify-center">
      <svg
        className="w-8 h-8 text-foreground/50"
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
  )
}
