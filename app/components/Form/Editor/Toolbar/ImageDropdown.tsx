"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection, $insertNodes } from "lexical"
import { $createImageNode } from "../nodes/ImageNode"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { Image as ImageIcon, X, Check } from "lucide-react"
import { DropdownMenu } from "./DropdownMenu"
import { ImageSelector } from "@/app/(admin)/admin/ImageSelector"

export function ImageDropdown() {
  const [editor] = useLexicalComposerContext()
  const [open, setOpen] = useState(false)
  const [src, setSrc] = useState("")
  const [alt, setAlt] = useState("")
  const [caption, setCaption] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)
  const inputId = useId()

  const handleClose = useCallback(() => {
    setOpen(false)
    setSrc("")
    setAlt("")
    setCaption("")
  }, [])

  const handleInsert = useCallback(() => {
    if (src.trim()) {
      editor.update(() => {
        const imageNode = $createImageNode(
          src.trim(),
          alt.trim() || "",
          undefined,
          undefined,
          caption.trim() || undefined
        )
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $insertNodes([imageNode])
        }
      })
      handleClose()
    }
  }, [editor, src, alt, caption])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && src.trim()) {
        e.preventDefault()
        handleInsert()
      } else if (e.key === "Escape") {
        e.preventDefault()
        handleClose()
      }
    },
    [src, handleInsert]
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
        trigger={<ImageIcon className="h-4 w-4" />}
        title="Insert Image"
        showChevron={false}
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            setSrc("")
            setAlt("")
            setCaption("")
          }
          setOpen(newOpen)
        }}
      >
        <div className="mb-1.5 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground">Insert Image</h3>
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
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/70">
              Image URL
            </label>
            <ImageSelector
              value={src}
              onValueChange={setSrc}
              placeholder="Select an image"
              showPreview={false}
              className="mt-1"
            />
          </div>
          <InputGroup
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Alt text (optional)"
            label="Alt Text"
            className="w-full"
          />
          <InputGroup
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
            label="Caption"
            className="w-full"
          />

          <div className="flex gap-1 pt-0.5">
            <Button
              onClick={handleInsert}
              variant="ghost"
              className="h-8 flex-1 text-xs font-medium flex items-center justify-center gap-1.5 rounded-md hover:bg-foreground/5 dark:hover:bg-foreground/10 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!src.trim()}
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
