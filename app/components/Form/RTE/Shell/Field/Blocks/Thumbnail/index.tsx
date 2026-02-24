"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useCallback, useEffect, useRef } from "react"
import { $getNodeByKey } from "lexical"
import { useBlockSelection } from "../BlockSelectionContext"
import { mergeRegister } from "@lexical/utils"
import { COMMAND_PRIORITY_LOW, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND } from "lexical"
import { ImageIcon } from "lucide-react"
import { cn } from "@/lib/cn"

const DEFAULT_WIDTH = 160
const DEFAULT_HEIGHT = 120

export interface ThumbnailBlockComponentProps {
  nodeKey: string
  src?: string
  alt?: string
  href?: string
  caption?: string
  width?: number
  height?: number
  alignment?: "left" | "center" | "right"
}

/**
 * Block component for a Thumbnail: small image with optional link.
 * Renders in the editor and participates in block selection.
 */
export function ThumbnailBlockComponent({
  nodeKey,
  src,
  alt,
  href,
  caption,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  alignment = "left",
}: ThumbnailBlockComponentProps) {
  const [editor] = useLexicalComposerContext()
  const { selectedNodeKey, selectBlock, clearSelection } = useBlockSelection()
  const isSelected = selectedNodeKey === nodeKey
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (isSelected) {
        clearSelection()
      } else {
        selectBlock(nodeKey, "thumbnail")
      }
    },
    [isSelected, nodeKey, selectBlock, clearSelection]
  )

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        () => {
          if (isSelected) {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey)
              if (node) {
                node.remove()
                clearSelection()
              }
            })
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        () => {
          if (isSelected) {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey)
              if (node) {
                node.remove()
                clearSelection()
              }
            })
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor, isSelected, nodeKey, clearSelection])

  const content = (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-foreground/10 dark:border-foreground/20 bg-foreground/5",
        "flex items-center justify-center",
        "text-foreground/50",
        alignment === "left" && "justify-start",
        alignment === "center" && "justify-center",
        alignment === "right" && "justify-end"
      )}
      style={{ width: `${width}px`, height: `${height}px`, minWidth: `${width}px`, minHeight: `${height}px` }}
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? ""}
          width={width}
          height={height}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <ImageIcon className="h-8 w-8" aria-hidden />
      )}
    </div>
  )

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "editor-block-wrapper my-2 cursor-pointer transition-all inline-block",
        isSelected && "ring-2 ring-accent rounded-lg p-1"
      )}
      onClick={handleClick}
    >
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
          onClick={(e) => e.preventDefault()}
        >
          {content}
        </a>
      ) : (
        content
      )}
      {caption && (
        <p className="text-xs text-foreground/60 mt-1 text-center" style={{ maxWidth: width }}>
          {caption}
        </p>
      )}
    </div>
  )
}

export { ThumbnailFloatingMenu } from "./FloatingMenu"
export type { ThumbnailFloatingMenuProps } from "./FloatingMenu"
export { ThumbnailBlockMenu } from "./ThumbnailBlockMenu"
export type { ThumbnailBlockMenuProps } from "./ThumbnailBlockMenu"
