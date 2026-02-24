"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useCallback, useEffect, useRef } from "react"
import { $getNodeByKey } from "lexical"
import { useBlockSelection } from "../BlockSelectionContext"
import { mergeRegister } from "@lexical/utils"
import { COMMAND_PRIORITY_LOW, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND } from "lexical"
import { BarChart3 } from "lucide-react"
import { cn } from "@/lib/cn"
import type { PollOption } from "@/app/components/Poll/types"

export interface PollBlockComponentProps {
  nodeKey: string
  /** Poll title */
  title?: string
  /** Optional description */
  description?: string
  /** Poll options */
  options?: PollOption[]
}

/**
 * Block component for a Poll: renders in the editor and participates in block selection.
 * Used as the decorator for PollNode when the node is added to the editor config.
 */
export function PollBlockComponent({
  nodeKey,
  title,
  description,
  options = [],
}: PollBlockComponentProps) {
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
        selectBlock(nodeKey, "poll")
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
          <BarChart3 className="h-4 w-4 text-foreground/60 shrink-0" />
          <span className="text-sm font-medium text-foreground/80">Poll</span>
        </div>
        <div className="p-3">
          {title || options.length > 0 ? (
            <div className="space-y-2">
              {title && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground/90">{title}</h3>
                  {description && (
                    <p className="text-xs text-foreground/60 mt-1">{description}</p>
                  )}
                </div>
              )}
              {options.length > 0 && (
                <div className="space-y-1.5 mt-3">
                  {options.map((option, i) => (
                    <div
                      key={option.id || i}
                      className="flex items-center gap-2 p-2 rounded-md bg-foreground/5 border border-foreground/10"
                    >
                      <div className="h-2 w-2 rounded-full bg-foreground/40" />
                      <span className="text-xs text-foreground/70">{option.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BarChart3 className="h-10 w-10 text-foreground/30 mb-2" />
              <p className="text-sm text-foreground/50">No poll content yet</p>
              <p className="text-xs text-foreground/40 mt-0.5">Add poll details when editing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { PollFloatingMenu } from "./FloatingMenu"
export type { PollFloatingMenuProps } from "./FloatingMenu"
