"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  $getSelection,
  $isRangeSelection,
  $createRangeSelection,
  $createPoint,
  $setSelection,
  $createTextNode,
  $insertNodes,
} from "lexical"
import type { PointType } from "lexical"
import { $createLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { X, Check, Unlink } from "lucide-react"
import { useToolbarDropdown } from "../DropdownContext"

function getLinkText(linkNode: { getChildren: () => { getTextContent: () => string }[] }): string {
  return linkNode.getChildren().map((c) => c.getTextContent()).join("")
}

export function LinkMenu() {
  const [editor] = useLexicalComposerContext()
  const dropdown = useToolbarDropdown()
  const [url, setUrl] = useState("")
  const [label, setLabel] = useState("")
  const [isActive, setIsActive] = useState(false)
  const urlInputId = useId()
  const labelInputId = useId()
  const savedSelectionRef = useRef<{ anchor: PointType; focus: PointType } | null>(null)

  useEffect(() => {
    if (!dropdown?.isOpen) return
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const [anchor, focus] = selection.getStartEndPoints() ?? []
        if (anchor && focus) {
          savedSelectionRef.current = {
            anchor: $createPoint(anchor.key, anchor.offset, anchor.type),
            focus: $createPoint(focus.key, focus.offset, focus.type),
          }
        } else {
          savedSelectionRef.current = null
        }
        const nodes = selection.getNodes()
        const node = nodes[0]
        const parent = node?.getParent()
        if ($isLinkNode(node)) {
          setUrl(node.getURL())
          setLabel(getLinkText(node))
          setIsActive(true)
        } else if ($isLinkNode(parent)) {
          setUrl(parent.getURL())
          setLabel(getLinkText(parent))
          setIsActive(true)
        } else {
          setUrl("")
          setLabel(selection.getTextContent())
          setIsActive(false)
        }
      } else {
        savedSelectionRef.current = null
        setUrl("")
        setLabel("")
        setIsActive(false)
      }
    })
  }, [editor, dropdown?.isOpen])

  const handleApply = useCallback(() => {
    const urlToApply = url.trim()
    if (!urlToApply) {
      dropdown?.onClose()
      return
    }
    const labelToApply = label.trim()
    editor.update(() => {
      const saved = savedSelectionRef.current
      if (saved) {
        const sel = $createRangeSelection()
        sel.anchor.set(saved.anchor.key, saved.anchor.offset, saved.anchor.type)
        sel.focus.set(saved.focus.key, saved.focus.offset, saved.focus.type)
        $setSelection(sel)
      }
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return
      const hasSelection = !selection.isCollapsed()
      if (labelToApply || !hasSelection) {
        const linkNode = $createLinkNode(urlToApply)
        linkNode.append($createTextNode(labelToApply || urlToApply))
        $insertNodes([linkNode])
      } else {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, urlToApply)
      }
    })
    savedSelectionRef.current = null
    dropdown?.onClose()
  }, [editor, url, label, dropdown])

  const handleRemove = useCallback(() => {
    editor.update(() => {
      const saved = savedSelectionRef.current
      if (saved) {
        const sel = $createRangeSelection()
        sel.anchor.set(saved.anchor.key, saved.anchor.offset, saved.anchor.type)
        sel.focus.set(saved.focus.key, saved.focus.offset, saved.focus.type)
        $setSelection(sel)
      }
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    })
    savedSelectionRef.current = null
    dropdown?.onClose()
  }, [editor, dropdown])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleApply()
      } else if (e.key === "Escape") {
        e.preventDefault()
        dropdown?.onClose()
      }
    },
    [handleApply, dropdown]
  )

  return (
    <div className="min-w-[220px] p-2">
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground">
          {isActive ? "Edit Link" : "Insert Link"}
        </h3>
        <Button
          onClick={() => dropdown?.onClose()}
          variant="ghost"
          className="h-6 w-6 p-0 rounded-md hover:bg-foreground/5 dark:hover:bg-foreground/10 text-foreground/70"
          title="Close"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-1.5">
        <InputGroup
          id={urlInputId}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://example.com"
          label="URL"
          className="w-full"
        />
        <InputGroup
          id={labelInputId}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Link text (optional)"
          label="Label"
          className="w-full"
        />
        <div className="flex gap-1 pt-0.5">
          <Button
            onClick={handleApply}
            variant="ghost"
            className="h-8 flex-1 text-xs font-medium flex items-center justify-center gap-1.5 rounded-md hover:bg-foreground/5 dark:hover:bg-foreground/10 disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!url.trim()}
          >
            <Check className="h-3.5 w-3.5" />
            {isActive ? "Update" : "Apply"}
          </Button>
          {isActive && (
            <Button
              onClick={handleRemove}
              variant="ghost"
              className="h-8 px-2.5 text-xs rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center"
              title="Remove link"
            >
              <Unlink className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
