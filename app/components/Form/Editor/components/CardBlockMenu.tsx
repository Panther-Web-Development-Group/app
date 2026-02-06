"use client"

import { useCallback, useEffect, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getNodeByKey } from "lexical"
import { $isCardNode } from "../nodes/CardNode"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { TextAreaGroup } from "@/app/components/Form/TextAreaGroup"
import { X, Check } from "lucide-react"

interface CardBlockMenuProps {
  nodeKey: string
  onClose: () => void
}

export function CardBlockMenu({ nodeKey, onClose }: CardBlockMenuProps) {
  const [editor] = useLexicalComposerContext()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [imageSrc, setImageSrc] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [linkHref, setLinkHref] = useState("")
  const [linkLabel, setLinkLabel] = useState("")

  // Load current values
  useEffect(() => {
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isCardNode(node)) {
        setTitle(node.__title || "")
        setBody(node.__body || "")
        setImageSrc(node.__image?.src || "")
        setImageAlt(node.__image?.alt || "")
        setLinkHref(node.__link?.href || "")
        setLinkLabel(node.__link?.label || "")
      }
    })
  }, [editor, nodeKey])

  const handleSave = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isCardNode(node)) {
        node.setTitle(title || undefined)
        node.setBody(body || undefined)
        node.setImage(
          imageSrc
            ? { src: imageSrc, alt: imageAlt || undefined }
            : undefined,
        )
        node.setLink(
          linkHref
            ? { href: linkHref, label: linkLabel || undefined }
            : undefined,
        )
      }
    })
    onClose()
  }, [editor, nodeKey, title, body, imageSrc, imageAlt, linkHref, linkLabel, onClose])

  return (
    <div className="w-64 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 shadow-lg backdrop-blur-sm max-h-[85vh] overflow-y-auto">
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground">Edit Card</h3>
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
        <InputGroup
          value={imageSrc}
          onChange={(e) => setImageSrc(e.target.value)}
          placeholder="Image URL (optional)"
          label="Image URL"
          className="w-full"
        />
        {imageSrc && (
          <div className="rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-1">
            <img
              src={imageSrc}
              alt="Preview"
              className="max-h-20 w-full rounded object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          </div>
        )}
        <InputGroup
          value={imageAlt}
          onChange={(e) => setImageAlt(e.target.value)}
          placeholder="Image alt text (optional)"
          label="Image Alt"
          className="w-full"
        />
        <InputGroup
          value={linkHref}
          onChange={(e) => setLinkHref(e.target.value)}
          placeholder="Link URL (optional)"
          label="Link URL"
          className="w-full"
        />
        <InputGroup
          value={linkLabel}
          onChange={(e) => setLinkLabel(e.target.value)}
          placeholder="Link label (optional)"
          label="Link Label"
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
