"use client"

import { Button } from "@/app/components/Button"
import { Image as ImageIcon, Pencil, Trash2 } from "lucide-react"

export interface ImageFloatingMenuProps {
  nodeKey: string
  onClose: () => void
  onEdit?: () => void
}

/** Floating menu content for an Image block. */
export function ImageFloatingMenu({ onClose, onEdit }: ImageFloatingMenuProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-foreground/10 dark:border-foreground/20 bg-background/95 backdrop-blur-sm p-0.5 shadow-lg">
      <Button
        onClick={onEdit}
        variant="ghost"
        className="h-7 w-7 p-0 hover:bg-foreground/5 dark:hover:bg-foreground/10"
        title="Edit image"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <div className="h-3.5 w-px bg-foreground/10 dark:bg-foreground/20" />
      <Button
        onClick={onClose}
        variant="ghost"
        className="h-7 w-7 p-0 text-foreground/70 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        title="Remove image"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
      <span className="ml-1.5 flex items-center gap-1 text-xs text-foreground/60" aria-hidden>
        <ImageIcon className="h-3 w-3" />
        Image
      </span>
    </div>
  )
}
