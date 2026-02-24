"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useCallback, useEffect, useRef } from "react"
import { $getNodeByKey } from "lexical"
import { useBlockSelection } from "../BlockSelectionContext"
import { mergeRegister } from "@lexical/utils"
import { COMMAND_PRIORITY_LOW, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND } from "lexical"
import { LayoutGrid } from "lucide-react"
import { cn } from "@/lib/cn"

export interface GalleryBlockComponentProps {
  nodeKey: string
  /** Optional image entries for when GalleryNode is wired (src, alt, etc.). */
  images?: Array<{ src: string; alt?: string }>
}

/**
 * Block component for a Gallery: renders in the editor and participates in block selection.
 * Used as the decorator for GalleryNode when the node is added to the editor config.
 */
export function GalleryBlockComponent({ nodeKey, images = [] }: GalleryBlockComponentProps) {
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
        selectBlock(nodeKey, "gallery")
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
          <LayoutGrid className="h-4 w-4 text-foreground/60 shrink-0" />
          <span className="text-sm font-medium text-foreground/80">Gallery</span>
        </div>
        <div className="p-3">
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-md overflow-hidden bg-foreground/5 border border-foreground/10"
                >
                  <img
                    src={img.src}
                    alt={img.alt ?? ""}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <LayoutGrid className="h-10 w-10 text-foreground/30 mb-2" />
              <p className="text-sm text-foreground/50">No images yet</p>
              <p className="text-xs text-foreground/40 mt-0.5">Add images when editing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { GalleryFloatingMenu } from "./FloatingMenu"
export type { GalleryFloatingMenuProps } from "./FloatingMenu"
