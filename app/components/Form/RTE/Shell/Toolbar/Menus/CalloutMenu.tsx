"use client"

import { useCallback, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection, $insertNodes } from "lexical"
import { $createCalloutNode } from "@/app/components/Form/RTE/nodes/callout"
import type { CalloutVariant } from "@/app/components/Form/RTE/nodes/callout"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { Check, InfoIcon, AlertTriangleIcon, LightbulbIcon } from "lucide-react"
import { useToolbarDropdown } from "../DropdownContext"
import { cn } from "@/lib/cn"

const VARIANTS: { value: CalloutVariant; label: string; icon: React.ReactNode }[] = [
  { value: "info", label: "Info", icon: <InfoIcon className="h-3.5 w-3.5" /> },
  { value: "warning", label: "Warning", icon: <AlertTriangleIcon className="h-3.5 w-3.5" /> },
  { value: "tip", label: "Tip", icon: <LightbulbIcon className="h-3.5 w-3.5" /> },
]

export function CalloutMenu() {
  const [editor] = useLexicalComposerContext()
  const dropdown = useToolbarDropdown()
  const [variant, setVariant] = useState<CalloutVariant>("info")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

  const handleClose = useCallback(() => {
    setTitle("")
    setBody("")
    setVariant("info")
    dropdown?.onClose()
  }, [dropdown])

  const handleInsert = useCallback(() => {
    editor.update(() => {
      const node = $createCalloutNode(variant, title.trim() || undefined, body.trim() || "Add callout text…")
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $insertNodes([node])
      }
    })
    handleClose()
  }, [editor, variant, title, body, handleClose])

  return (
    <div className="min-w-0 overflow-hidden p-2">
      <div className="min-w-0 space-y-1.5">
        <div>
          <span className="mb-1 block text-xs font-medium text-foreground/70">Type</span>
          <div className="flex gap-1">
            {VARIANTS.map((v) => (
              <button
                key={v.value}
                type="button"
                onClick={() => setVariant(v.value)}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1.5 text-xs transition-colors",
                  variant === v.value
                    ? "bg-foreground/10 dark:bg-foreground/20 text-foreground"
                    : "hover:bg-foreground/5 dark:hover:bg-foreground/10 text-foreground/70"
                )}
              >
                {v.icon}
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <InputGroup
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          label="Title"
          className="w-full"
        />
        <InputGroup
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Callout text…"
          label="Body"
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
