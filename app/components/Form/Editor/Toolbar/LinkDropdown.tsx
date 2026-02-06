"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection } from "lexical"
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { Link, X, Check, Unlink } from "lucide-react"
import { DropdownMenu } from "./DropdownMenu"

interface LinkDropdownProps {
  isActive: boolean
}

export function LinkDropdown({ isActive }: LinkDropdownProps) {
  const [editor] = useLexicalComposerContext()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)
  const inputId = useId()

  // Load current link URL when dropdown opens
  useEffect(() => {
    if (open) {
      editor.getEditorState().read(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes()
          const node = nodes[0]
          const parent = node?.getParent()

          if ($isLinkNode(node)) {
            setUrl(node.getURL())
          } else if ($isLinkNode(parent)) {
            setUrl(parent.getURL())
          } else {
            setUrl("")
          }
        } else {
          setUrl("")
        }
      })

      // Focus input after a short delay
      setTimeout(() => {
        const input = rootRef.current?.querySelector(`#${inputId}`) as HTMLInputElement
        if (input) {
          input.focus()
          input.select()
        }
      }, 0)
    }
  }, [open, editor, inputId])

  const handleApply = useCallback(() => {
    if (url.trim()) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url.trim())
    }
    setOpen(false)
  }, [editor, url])

  const handleRemove = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    setOpen(false)
  }, [editor])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleApply()
      } else if (e.key === "Escape") {
        e.preventDefault()
        setOpen(false)
      }
    },
    [handleApply]
  )

  return (
    <div ref={rootRef}>
      <DropdownMenu
        trigger={<Link className="h-4 w-4" />}
        isActive={isActive}
        title="Link (Ctrl+K)"
        showChevron={false}
        disabled={false}
        onOpenChange={setOpen}
        open={open}
      >
        <div className="mb-1.5 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground">
            {isActive ? "Edit Link" : "Insert Link"}
          </h3>
          <Button
            onClick={() => setOpen(false)}
            variant="ghost"
            className="h-6 w-6 p-0 rounded-md hover:bg-foreground/5 dark:hover:bg-foreground/10 text-foreground/70"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="space-y-1.5">
          <InputGroup
            id={inputId}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com"
            label="URL"
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
                className="h-8 px-2.5 text-xs rounded-md text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center"
                title="Remove link"
              >
                <Unlink className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </DropdownMenu>
    </div>
  )
}
