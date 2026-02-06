"use client"

import { useCallback, useEffect, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getNodeByKey } from "lexical"
import { $isVideoNode } from "../nodes/VideoNode"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { Checkbox } from "@/app/components/Form/Checkbox"
import { X, Check } from "lucide-react"

interface VideoBlockMenuProps {
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

  // Load current values
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
        node.setPoster(poster || undefined)
        node.setAutoplay(autoplay)
        node.setControls(controls)
        node.setLoop(loop)
        node.setMuted(muted)
      }
    })
    onClose()
  }, [editor, nodeKey, src, poster, autoplay, controls, loop, muted, onClose])

  return (
    <div className="w-64 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 shadow-lg backdrop-blur-sm">
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground">Edit Video</h3>
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

        <div className="space-y-1 pt-1 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-xs font-medium text-foreground mb-1">Settings</div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex items-center gap-1.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Checkbox
                checked={autoplay}
                onCheckedChange={setAutoplay}
                label="Autoplay"
                className="flex-1 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Checkbox
                checked={controls}
                onCheckedChange={setControls}
                label="Controls"
                className="flex-1 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Checkbox
                checked={loop}
                onCheckedChange={setLoop}
                label="Loop"
                className="flex-1 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
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
