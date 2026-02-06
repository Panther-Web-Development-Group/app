"use client"

import { useCallback, useEffect, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getNodeByKey } from "lexical"
import { $isImageNode } from "../nodes/ImageNode"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { X, Check } from "lucide-react"
import { ImageSelector } from "@/app/(admin)/admin/ImageSelector"

interface ImageBlockMenuProps {
  nodeKey: string
  onClose: () => void
}

export function ImageBlockMenu({ nodeKey, onClose }: ImageBlockMenuProps) {
  const [editor] = useLexicalComposerContext()
  const [src, setSrc] = useState("")
  const [alt, setAlt] = useState("")
  const [caption, setCaption] = useState("")

  // Load current values
  useEffect(() => {
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isImageNode(node)) {
        setSrc(node.__src)
        setAlt(node.__alt)
        setCaption(node.__caption || "")
      }
    })
  }, [editor, nodeKey])

  const handleSave = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isImageNode(node)) {
        node.setSrc(src)
        node.setAlt(alt)
        node.setCaption(caption || undefined)
      }
    })
    onClose()
  }, [editor, nodeKey, src, alt, caption, onClose])

  return (
    <div className="w-64 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 shadow-lg backdrop-blur-sm">
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground">Edit Image</h3>
        <Button
          onClick={onClose}
          variant="ghost"
          className="h-4 w-4 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          title="Close"
        >
          <X className="h-3 w-3" />
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
            onClick={handleSave}
            variant="ghost"
            className="h-7 flex-1 text-xs font-medium flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Check className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="h-7 px-2 text-xs flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
