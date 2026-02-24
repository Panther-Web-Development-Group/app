"use client"

import { useCallback, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection, $insertNodes } from "lexical"
import { $createThumbnailNode } from "@/app/components/Form/RTE/nodes/thumbnail"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { Check } from "lucide-react"
import { ImageSelector } from "@/app/(admin)/admin/ImageSelector"
import { useToolbarDropdown } from "../DropdownContext"

export function ThumbnailMenu() {
  const [editor] = useLexicalComposerContext()
  const dropdown = useToolbarDropdown()
  const [src, setSrc] = useState<string | null>(null)
  const [alt, setAlt] = useState("")
  const [href, setHref] = useState("")
  const [caption, setCaption] = useState("")

  const handleClose = useCallback(() => {
    setSrc("")
    setAlt("")
    setHref("")
    setCaption("")
    dropdown?.onClose()
  }, [dropdown])

  const handleInsert = useCallback(() => {
    if (src && src.trim()) {
      editor.update(() => {
        const thumbnailNode = $createThumbnailNode(
          src.trim(),
          alt.trim() || "",
          href.trim() || undefined,
          caption.trim() || undefined
        )
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $insertNodes([thumbnailNode])
        }
      })
      handleClose()
    }
  }, [editor, src, alt, href, caption, handleClose])

  return (
    <div className="min-w-0 overflow-hidden p-2">
      <div className="min-w-0 space-y-1.5">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/70">Image URL</label>
          <ImageSelector
            value={src ?? undefined}
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
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="Link URL (optional)"
          label="Link"
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
            disabled={!src || !src.trim()}
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
