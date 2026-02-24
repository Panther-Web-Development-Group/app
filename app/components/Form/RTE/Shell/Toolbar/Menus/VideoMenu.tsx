"use client"

import { useCallback, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection, $insertNodes } from "lexical"
import { $createVideoNode } from "@/app/components/Form/RTE/nodes/video"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { X, Check } from "lucide-react"
import { useToolbarDropdown } from "../DropdownContext"

export function VideoMenu() {
  const [editor] = useLexicalComposerContext()
  const dropdown = useToolbarDropdown()
  const [src, setSrc] = useState("")
  const [poster, setPoster] = useState("")

  const handleClose = useCallback(() => {
    setSrc("")
    setPoster("")
    dropdown?.onClose()
  }, [dropdown])

  const handleInsert = useCallback(() => {
    if (src.trim()) {
      editor.update(() => {
        const videoNode = $createVideoNode(src.trim(), poster.trim() || undefined)
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $insertNodes([videoNode])
        }
      })
      handleClose()
    }
  }, [editor, src, poster, handleClose])

  return (
    <div className="min-w-[260px] p-2">
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground">Insert Video</h3>
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
          value={src}
          onChange={(e) => setSrc(e.target.value)}
          placeholder="https://example.com/video.mp4"
          label="Video URL"
          className="w-full"
        />
        <InputGroup
          value={poster}
          onChange={(e) => setPoster(e.target.value)}
          placeholder="Poster URL (optional)"
          label="Poster Image"
          className="w-full"
        />
        {poster ? (
          <div className="rounded border border-foreground/10 bg-foreground/5 p-1">
            <img
              src={poster}
              alt="Poster preview"
              className="max-h-20 w-full rounded object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          </div>
        ) : null}
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
    </div>
  )
}
