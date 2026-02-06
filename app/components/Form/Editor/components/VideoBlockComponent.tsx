"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useCallback, useEffect, useRef } from "react"
import { $getNodeByKey } from "lexical"
import { $isVideoNode } from "../nodes/VideoNode"
import { Video } from "@/app/components/Video"
import { useBlockSelection } from "./BlockSelectionContext"
import { mergeRegister } from "@lexical/utils"
import { KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND, COMMAND_PRIORITY_LOW } from "lexical"
import { cn } from "@/lib/cn"

interface VideoBlockComponentProps {
  src: string
  poster?: string
  autoplay?: boolean
  controls?: boolean
  loop?: boolean
  muted?: boolean
  width?: number
  height?: number
  nodeKey: string
}

export function VideoBlockComponent({
  src,
  poster,
  autoplay,
  controls,
  loop,
  muted,
  width,
  height,
  nodeKey,
}: VideoBlockComponentProps) {
  const [editor] = useLexicalComposerContext()
  const { selectedNodeKey, selectBlock, clearSelection } = useBlockSelection()
  const isSelected = selectedNodeKey === nodeKey
  const videoRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (isSelected) {
        clearSelection()
      } else {
        selectBlock(nodeKey, "video")
      }
    },
    [isSelected, nodeKey, selectBlock, clearSelection]
  )

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        () => {
          if (isSelected) {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey)
              if ($isVideoNode(node)) {
                node.remove()
                clearSelection()
              }
            })
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        () => {
          if (isSelected) {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey)
              if ($isVideoNode(node)) {
                node.remove()
                clearSelection()
              }
            })
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor, isSelected, nodeKey, clearSelection])

  return (
    <div
      ref={videoRef}
      className={cn(
        "editor-block-wrapper my-4 cursor-pointer transition-all",
        isSelected && "ring-2 ring-accent rounded-lg p-1"
      )}
      onClick={handleClick}
    >
      <div className="rounded-lg border border-(--pw-border) overflow-hidden">
        {src ? (
          <Video
            src={src}
            poster={poster || undefined}
            autoPlay={autoplay}
            controls={controls}
            loop={loop}
            muted={muted}
            width={width}
            height={height}
            className="w-full"
          />
        ) : (
          <div className="flex h-48 items-center justify-center bg-background/10 text-sm text-foreground/50">
            No video URL provided
          </div>
        )}
      </div>
    </div>
  )
}
