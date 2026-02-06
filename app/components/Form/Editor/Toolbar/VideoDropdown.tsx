"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection, $insertNodes } from "lexical"
import { $createVideoNode } from "../nodes/VideoNode"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { Video as VideoIcon, X, Check } from "lucide-react"
import { DropdownMenu } from "./DropdownMenu"

export function VideoDropdown() {
  const [editor] = useLexicalComposerContext()
  const [open, setOpen] = useState(false)
  const [src, setSrc] = useState("")
  const [poster, setPoster] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)
  const inputId = useId()

  const handleClose = useCallback(() => {
    setOpen(false)
    setSrc("")
    setPoster("")
  }, [])

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
  }, [editor, src, poster])

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
        trigger={<VideoIcon className="h-4 w-4" />}
        title="Insert Video"
        showChevron={false}
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            setSrc("")
            setPoster("")
          }
          setOpen(newOpen)
        }}
      >
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
            id={inputId}
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            onKeyDown={handleKeyDown}
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
          {poster && (
            <div className="rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-1">
              <img
                src={poster}
                alt="Poster preview"
                className="max-h-20 w-full rounded object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>
          )}

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
