"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection, $insertNodes } from "lexical"
import { $createCardNode } from "../nodes/CardNode"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { TextAreaGroup } from "@/app/components/Form/TextAreaGroup"
import { Square, X, Check } from "lucide-react"
import { DropdownMenu } from "./DropdownMenu"

export function CardDropdown() {
  const [editor] = useLexicalComposerContext()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)
  const inputId = useId()

  const handleClose = useCallback(() => {
    setOpen(false)
    setTitle("")
    setBody("")
  }, [])

  const handleInsert = useCallback(() => {
    editor.update(() => {
      const cardNode = $createCardNode(
        title.trim() || undefined,
        body.trim() || undefined
      )
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $insertNodes([cardNode])
      }
    })
    handleClose()
  }, [editor, title, body, handleClose])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        e.preventDefault()
        handleClose()
      }
    },
    [handleClose]
  )

  // Focus input when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const input = rootRef.current?.querySelector(`#${inputId}`) as HTMLInputElement
        if (input) {
          input.focus()
        }
      }, 0)
    }
  }, [open, inputId])

  return (
    <div ref={rootRef}>
      <DropdownMenu
        trigger={<Square className="h-4 w-4" />}
        title="Insert Card"
        showChevron={false}
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            setTitle("")
            setBody("")
          }
          setOpen(newOpen)
        }}
      >
        <div className="mb-1.5 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground">Insert Card</h3>
          <Button
            onClick={handleClose}
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Title (optional)"
            label="Title"
            className="w-full"
          />
          <TextAreaGroup
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Description (optional)"
            label="Description"
            rows={2}
            className="w-full"
          />

          <div className="flex gap-1 pt-0.5">
            <Button
              onClick={handleInsert}
              variant="ghost"
              className="h-8 flex-1 text-xs font-medium flex items-center justify-center gap-1.5 rounded-md hover:bg-foreground/5 dark:hover:bg-foreground/10"
            >
              <Check className="h-3.5 w-3.5" />
              Insert
            </Button>
            <Button
              onClick={handleClose}
              variant="ghost"
              className="h-8 px-2.5 text-xs rounded-md flex items-center justify-center hover:bg-foreground/5 dark:hover:bg-foreground/10"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DropdownMenu>
    </div>
  )
}
