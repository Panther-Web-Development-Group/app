"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useCallback, useEffect, useRef } from "react"
import { $getNodeByKey } from "lexical"
import { useBlockSelection } from "../BlockSelectionContext"
import { mergeRegister } from "@lexical/utils"
import { COMMAND_PRIORITY_LOW, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND } from "lexical"
import { Video as VideoIcon } from "lucide-react"
import { cn } from "@/lib/cn"
import { Video } from "@/app/components/Video"

export interface VideoBlockComponentProps {
  nodeKey: string
  /** Video source URL */
  src?: string
  /** Poster image URL */
  poster?: string
  /** Autoplay */
  autoplay?: boolean
  /** Show controls */
  controls?: boolean
  /** Loop video */
  loop?: boolean
  /** Muted */
  muted?: boolean
  /** Video width */
  width?: number
  /** Video height */
  height?: number
}

/**
 * Block component for a Video: renders in the editor and participates in block selection.
 * Used as the decorator for VideoNode when the node is added to the editor config.
 */
export function VideoBlockComponent({
  nodeKey,
  src,
  poster,
  autoplay,
  controls,
  loop,
  muted,
  width,
  height,
}: VideoBlockComponentProps) {
  const [editor] = useLexicalComposerContext()
  const { selectedNodeKey, selectBlock, clearSelection } = useBlockSelection()
  const isSelected = selectedNodeKey === nodeKey
  const wrapperRef = useRef<HTMLDivElement>(null)

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
              if (node) {
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
              if (node) {
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
      ref={wrapperRef}
      className={cn(
        "editor-block-wrapper my-4 cursor-pointer transition-all",
        isSelected && "ring-2 ring-accent rounded-lg p-1"
      )}
      onClick={handleClick}
    >
      <div className="rounded-lg border border-foreground/10 dark:border-foreground/20 overflow-hidden">
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
          <div className="flex flex-col items-center justify-center py-12 text-center bg-background/5 border border-foreground/10">
            <VideoIcon className="h-10 w-10 text-foreground/30 mb-2" />
            <p className="text-sm text-foreground/50">No video yet</p>
            <p className="text-xs text-foreground/40 mt-0.5">Add video when editing</p>
          </div>
        )}
      </div>
    </div>
  )
}

export { VideoFloatingMenu } from "./FloatingMenu"
export type { VideoFloatingMenuProps } from "./FloatingMenu"
export { VideoBlockMenu } from "./VideoBlockMenu"
export type { VideoBlockMenuProps } from "./VideoBlockMenu"
