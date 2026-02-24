"use client"

import { useCallback, useEffect, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection } from "lexical"
import { $findTableNode } from "@lexical/table"
import { SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_LOW } from "lexical"
import { Table2 } from "lucide-react"
import { useBlockSelection } from "../BlockSelectionContext"
import { cn } from "@/lib/cn"

/** Shows a "Table" handle when caret is in a table. Clicking it selects the table and opens the floating menu. */
export function TableHandle() {
  const [editor] = useLexicalComposerContext()
  const { selectedNodeKey, selectBlock } = useBlockSelection()
  const [state, setState] = useState<{ tableKey: string; top: number; left: number } | null>(null)

  const updatePosition = useCallback(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) {
      setState(null)
      return
    }
    const tableNode = $findTableNode(selection.anchor.getNode())
    if (!tableNode) {
      setState(null)
      return
    }
    const tableKey = tableNode.getKey()
    const el = editor.getElementByKey(tableKey)
    const root = editor.getRootElement()
    const container = root?.parentElement
    if (!el || !container) {
      setState(null)
      return
    }
    const rect = el.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    setState({
      tableKey,
      top: rect.top - containerRect.top - 2,
      left: rect.left - containerRect.left - 2,
    })
  }, [editor])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updatePosition()
        return false
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor, updatePosition])

  useEffect(() => {
    if (!state) return
    const handleUpdate = () => {
      editor.getEditorState().read(updatePosition)
    }
    window.addEventListener("scroll", handleUpdate, true)
    window.addEventListener("resize", handleUpdate)
    return () => {
      window.removeEventListener("scroll", handleUpdate, true)
      window.removeEventListener("resize", handleUpdate)
    }
  }, [state, updatePosition, editor])

  if (!state) return null
  if (selectedNodeKey === state.tableKey) return null

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    selectBlock(state.tableKey, "table")
  }

  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={handleClick}
      className={cn(
        "absolute z-40 flex items-center gap-1 rounded-md border border-foreground/10 dark:border-foreground/20",
        "bg-background/95 backdrop-blur-sm px-1.5 py-0.5 shadow-md",
        "text-xs font-medium text-foreground/80 hover:bg-foreground/5 dark:hover:bg-foreground/10",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
      )}
      style={{ top: `${state.top}px`, left: `${state.left}px` }}
      title="Select table"
    >
      <Table2 className="h-3.5 w-3.5" />
      Table
    </button>
  )
}
