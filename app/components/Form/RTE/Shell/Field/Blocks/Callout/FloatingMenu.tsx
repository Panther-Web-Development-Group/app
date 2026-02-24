"use client"

import { useCallback } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getNodeByKey } from "lexical"
import { Button } from "@/app/components/Button"
import { MessageSquareIcon, Trash2, MoveUp, MoveDown } from "lucide-react"
import { $isCalloutNode } from "@/app/components/Form/RTE/nodes/callout"

export interface CalloutFloatingMenuProps {
  nodeKey: string
  onClose: () => void
  onEdit?: () => void
}

/** Floating menu for a Callout block: move, delete. */
export function CalloutFloatingMenu({
  nodeKey,
  onClose,
}: CalloutFloatingMenuProps) {
  const [editor] = useLexicalComposerContext()

  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isCalloutNode(node)) {
        node.remove()
        onClose()
      }
    })
  }, [editor, nodeKey, onClose])

  const handleMoveUp = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (!node) return
      const previousSibling = node.getPreviousSibling()
      if (previousSibling) {
        node.insertBefore(previousSibling)
      }
    })
  }, [editor, nodeKey])

  const handleMoveDown = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (!node) return
      const nextSibling = node.getNextSibling()
      if (nextSibling) {
        node.insertAfter(nextSibling)
      }
    })
  }, [editor, nodeKey])

  return (
    <div className="flex items-center gap-0.5 rounded-md border border-foreground/10 dark:border-foreground/20 bg-background/95 backdrop-blur-sm p-0.5 shadow-lg">
      <Button
        onClick={handleMoveUp}
        variant="ghost"
        className="h-7 w-7 p-0 hover:bg-foreground/5 dark:hover:bg-foreground/10"
        title="Move up"
      >
        <MoveUp className="h-3.5 w-3.5" />
      </Button>
      <Button
        onClick={handleMoveDown}
        variant="ghost"
        className="h-7 w-7 p-0 hover:bg-foreground/5 dark:hover:bg-foreground/10"
        title="Move down"
      >
        <MoveDown className="h-3.5 w-3.5" />
      </Button>
      <div className="h-3.5 w-px bg-foreground/10 dark:bg-foreground/20" />
      <Button
        onClick={handleDelete}
        variant="ghost"
        className="h-7 w-7 p-0 text-foreground/70 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        title="Remove callout"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
      <span className="ml-1.5 flex items-center gap-1 text-xs text-foreground/60" aria-hidden>
        <MessageSquareIcon className="h-3 w-3" />
        Callout
      </span>
    </div>
  )
}
