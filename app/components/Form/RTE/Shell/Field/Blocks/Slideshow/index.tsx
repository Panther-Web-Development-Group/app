"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useCallback, useEffect, useRef } from "react"
import { $getNodeByKey } from "lexical"
import { useBlockSelection } from "../BlockSelectionContext"
import { mergeRegister } from "@lexical/utils"
import { COMMAND_PRIORITY_LOW, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND } from "lexical"
import { Presentation } from "lucide-react"
import { cn } from "@/lib/cn"

export interface SlideshowBlockComponentProps {
  nodeKey: string
  /** Slideshow title */
  title?: string
  /** Optional description */
  description?: string
  /** Number of slides */
  slideCount?: number
}

/**
 * Block component for a Slideshow: renders in the editor and participates in block selection.
 * Used as the decorator for SlideshowNode when the node is added to the editor config.
 */
export function SlideshowBlockComponent({
  nodeKey,
  title,
  description,
  slideCount = 0,
}: SlideshowBlockComponentProps) {
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
        selectBlock(nodeKey, "slideshow")
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
          <Presentation className="h-4 w-4 text-foreground/60 shrink-0" />
          <span className="text-sm font-medium text-foreground/80">Slideshow</span>
        </div>
        <div className="p-3">
          {title || slideCount > 0 ? (
            <div className="space-y-2">
              {title && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground/90">{title}</h3>
                  {description && (
                    <p className="text-xs text-foreground/60 mt-1">{description}</p>
                  )}
                </div>
              )}
              {slideCount > 0 && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-foreground/5 border border-foreground/10">
                  <Presentation className="h-3 w-3 text-foreground/50" />
                  <span className="text-xs text-foreground/70">
                    {slideCount} slide{slideCount !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Presentation className="h-10 w-10 text-foreground/30 mb-2" />
              <p className="text-sm text-foreground/50">No slideshow content yet</p>
              <p className="text-xs text-foreground/40 mt-0.5">Add slides when editing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { SlideshowFloatingMenu } from "./FloatingMenu"
export type { SlideshowFloatingMenuProps } from "./FloatingMenu"
