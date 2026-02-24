"use client"

import { useCallback } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getNodeByKey } from "lexical"
import { Button } from "@/app/components/Button"
import { ImageIcon, Pencil, Trash2, MoveUp, MoveDown } from "lucide-react"
import { $isThumbnailNode } from "@/app/components/Form/RTE/nodes/thumbnail"

export interface ThumbnailFloatingMenuProps {
  nodeKey: string
  onClose: () => void
  onEdit?: () => void
}

/** Floating menu for a Thumbnail block: edit, move, delete. */
export function ThumbnailFloatingMenu({
  nodeKey,
  onClose,
  onEdit,
}: ThumbnailFloatingMenuProps) {
  const [editor] = useLexicalComposerContext()

  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isThumbnailNode(node)) {
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
        onClick={onEdit}
        variant="ghost"
        className="h-7 w-7 p-0 hover:bg-foreground/5 dark:hover:bg-foreground/10"
        title="Edit thumbnail"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <div className="h-3.5 w-px bg-foreground/10 dark:bg-foreground/20" />
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
        title="Remove thumbnail"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
      <span className="ml-1.5 flex items-center gap-1 text-xs text-foreground/60" aria-hidden>
        <ImageIcon className="h-3 w-3" />
        Thumbnail
      </span>
    </div>
  )
}
