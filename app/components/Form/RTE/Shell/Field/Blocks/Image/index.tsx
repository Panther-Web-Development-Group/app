"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useCallback, useEffect, useRef } from "react"
import { $getNodeByKey } from "lexical"
import { useBlockSelection } from "../BlockSelectionContext"
import { mergeRegister } from "@lexical/utils"
import { COMMAND_PRIORITY_LOW, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND } from "lexical"
import { Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/cn"

export interface ImageBlockComponentProps {
  nodeKey: string
  /** Image source URL */
  src?: string
  /** Image alt text */
  alt?: string
  /** Image width */
  width?: number
  /** Image height */
  height?: number
  /** Image caption */
  caption?: string
}

/**
 * Block component for an Image: renders in the editor and participates in block selection.
 * Used as the decorator for ImageNode when the node is added to the editor config.
 */
export function ImageBlockComponent({
  nodeKey,
  src,
  alt,
  width,
  height,
  caption,
}: ImageBlockComponentProps) {
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
        selectBlock(nodeKey, "image")
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

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "editor-block-wrapper my-4 cursor-pointer transition-all",
        isSelected && "ring-2 ring-accent rounded-lg p-1"
      )}
      onClick={handleClick}
    >
      <div className="rounded-lg border border-foreground/10 dark:border-foreground/20 bg-background/5 overflow-hidden">
        <div className="flex items-center gap-2 p-3 border-b border-foreground/10 dark:border-foreground/20">
          <ImageIcon className="h-4 w-4 text-foreground/60 shrink-0" />
          <span className="text-sm font-medium text-foreground/80">Image</span>
        </div>
        <div className="p-3">
          {src ? (
            <div className="space-y-2">
              <div className="rounded-md overflow-hidden bg-foreground/5 border border-foreground/10">
                <img
                  src={src}
                  alt={alt ?? ""}
                  width={width}
                  height={height}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
              {caption && (
                <p className="text-xs text-foreground/60 italic text-center">{caption}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ImageIcon className="h-10 w-10 text-foreground/30 mb-2" />
              <p className="text-sm text-foreground/50">No image yet</p>
              <p className="text-xs text-foreground/40 mt-0.5">Add image when editing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { ImageFloatingMenu } from "./FloatingMenu"
export type { ImageFloatingMenuProps } from "./FloatingMenu"
