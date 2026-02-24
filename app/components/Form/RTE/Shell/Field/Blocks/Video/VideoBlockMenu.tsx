"use client"

import { useCallback, useEffect, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getNodeByKey } from "lexical"
import { $isVideoNode } from "@/app/components/Form/RTE/nodes/video"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { Checkbox } from "@/app/components/Form/Checkbox"
import { X, Check } from "lucide-react"

export interface VideoBlockMenuProps {
  nodeKey: string
  onClose: () => void
}

export function VideoBlockMenu({ nodeKey, onClose }: VideoBlockMenuProps) {
  const [editor] = useLexicalComposerContext()
  const [src, setSrc] = useState("")
  const [poster, setPoster] = useState("")
  const [autoplay, setAutoplay] = useState(true)
  const [controls, setControls] = useState(true)
  const [loop, setLoop] = useState(false)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isVideoNode(node)) {
        setSrc(node.__src)
        setPoster(node.__poster || "")
        setAutoplay(node.__autoplay ?? true)
        setControls(node.__controls ?? true)
        setLoop(node.__loop ?? false)
        setMuted(node.__muted ?? false)
      }
    })
  }, [editor, nodeKey])

  const handleSave = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isVideoNode(node)) {
        node.setSrc(src)
        node.setPoster(poster.trim() || undefined)
        node.setAutoplay(autoplay)
        node.setControls(controls)
        node.setLoop(loop)
        node.setMuted(muted)
      }
    })
    onClose()
  }, [editor, nodeKey, src, poster, autoplay, controls, loop, muted, onClose])

  return (
    <div className="w-64 rounded-md border border-foreground/10 dark:border-foreground/20 bg-background/95 dark:bg-background p-2 shadow-lg backdrop-blur-sm">
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground">Edit Video</h3>
        <Button
          onClick={onClose}
          variant="ghost"
          className="h-4 w-4 p-0 hover:bg-foreground/5 dark:hover:bg-foreground/10"
          title="Close"
        >
          <X className="h-3 w-3" />
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

        <div className="space-y-1 pt-1 border-t border-foreground/10">
          <div className="text-xs font-medium text-foreground mb-1">Settings</div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex items-center gap-1.5 rounded border border-foreground/10 bg-foreground/5 p-1.5">
              <Checkbox
                checked={autoplay}
                onCheckedChange={setAutoplay}
                label="Autoplay"
                className="flex-1 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 rounded border border-foreground/10 bg-foreground/5 p-1.5">
              <Checkbox
                checked={controls}
                onCheckedChange={setControls}
                label="Controls"
                className="flex-1 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 rounded border border-foreground/10 bg-foreground/5 p-1.5">
              <Checkbox
                checked={loop}
                onCheckedChange={setLoop}
                label="Loop"
                className="flex-1 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 rounded border border-foreground/10 bg-foreground/5 p-1.5">
              <Checkbox
                checked={muted}
                onCheckedChange={setMuted}
                label="Muted"
                className="flex-1 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-1 pt-0.5">
          <Button
            onClick={handleSave}
            variant="ghost"
            className="h-7 flex-1 text-xs font-medium flex items-center justify-center gap-1 rounded-md hover:bg-foreground/5 dark:hover:bg-foreground/10"
          >
            <Check className="h-3 w-3" />
            Save
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="h-7 px-2 text-xs flex items-center justify-center hover:bg-foreground/5 dark:hover:bg-foreground/10"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
