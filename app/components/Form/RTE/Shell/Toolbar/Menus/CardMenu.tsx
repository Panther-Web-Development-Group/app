"use client"

import { useCallback, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection, $insertNodes } from "lexical"
import { $createCardNode } from "@/app/components/Form/Editor/nodes/CardNode"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { TextAreaGroup } from "@/app/components/Form/TextAreaGroup"
import { X, Check } from "lucide-react"
import { useToolbarDropdown } from "../DropdownContext"

export function CardMenu() {
  const [editor] = useLexicalComposerContext()
  const dropdown = useToolbarDropdown()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

  const handleClose = useCallback(() => {
    setTitle("")
    setBody("")
    dropdown?.onClose()
  }, [dropdown])

  const handleInsert = useCallback(() => {
    editor.update(() => {
      const cardNode = $createCardNode(title.trim() || undefined, body.trim() || undefined)
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $insertNodes([cardNode])
      }
    })
    handleClose()
  }, [editor, title, body, handleClose])

  return (
    <div className="min-w-[260px] p-2">
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          label="Title"
          className="w-full"
        />
        <TextAreaGroup
          value={body}
          onChange={(e) => setBody(e.target.value)}
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
    </div>
  )
}
