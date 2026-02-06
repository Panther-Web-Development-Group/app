"use client"

import { useCallback } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getNodeByKey } from "lexical"
import { $isImageNode, ImageNode } from "../nodes/ImageNode"
import { $isCardNode, CardNode } from "../nodes/CardNode"
import { $isVideoNode, VideoNode } from "../nodes/VideoNode"
import { Button } from "@/app/components/Button"
import { Pencil, Trash2, MoveUp, MoveDown } from "lucide-react"

interface BlockMenuProps {
  nodeKey: string
  nodeType: "image" | "card" | "video"
  onEdit?: () => void
}

export function BlockMenu({ nodeKey, nodeType, onEdit }: BlockMenuProps) {
  const [editor] = useLexicalComposerContext()

  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (
        ($isImageNode(node) || $isCardNode(node) || $isVideoNode(node)) &&
        node
      ) {
        node.remove()
      }
    })
  }, [editor, nodeKey])

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
    <div className="flex items-center gap-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-0.5 shadow-lg backdrop-blur-sm">
      <Button
        onClick={onEdit}
        variant="ghost"
        className="h-7 w-7 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        title="Edit"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <div className="h-3.5 w-px bg-zinc-200 dark:bg-zinc-800" />
      <Button
        onClick={handleMoveUp}
        variant="ghost"
        className="h-7 w-7 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        title="Move up"
      >
        <MoveUp className="h-3.5 w-3.5" />
      </Button>
      <Button
        onClick={handleMoveDown}
        variant="ghost"
        className="h-7 w-7 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        title="Move down"
      >
        <MoveDown className="h-3.5 w-3.5" />
      </Button>
      <div className="h-3.5 w-px bg-zinc-200 dark:bg-zinc-800" />
      <Button
        onClick={handleDelete}
        variant="ghost"
        className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
