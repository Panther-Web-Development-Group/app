"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useCallback, useEffect, useRef } from "react"
import { $getNodeByKey } from "lexical"
import { $isImageNode } from "../nodes/ImageNode"
import { useBlockSelection } from "./BlockSelectionContext"
import { mergeRegister } from "@lexical/utils"
import { CLICK_COMMAND, COMMAND_PRIORITY_LOW, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND } from "lexical"
import { cn } from "@/lib/cn"

interface ImageBlockComponentProps {
  src: string
  alt: string
  width?: number
  height?: number
  caption?: string
  nodeKey: string
}

export function ImageBlockComponent({
  src,
  alt,
  width,
  height,
  caption,
  nodeKey,
}: ImageBlockComponentProps) {
  const [editor] = useLexicalComposerContext()
  const { selectedNodeKey, selectBlock, clearSelection } = useBlockSelection()
  const isSelected = selectedNodeKey === nodeKey
  const imageRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (isSelected) {
        clearSelection()
      } else {
        selectBlock(nodeKey, "image")
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
              if ($isImageNode(node)) {
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
              if ($isImageNode(node)) {
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
      ref={imageRef}
      className={cn(
        "editor-block-wrapper my-4 cursor-pointer transition-all",
        isSelected && "ring-2 ring-accent rounded-lg p-1"
      )}
      onClick={handleClick}
    >
      <figure className="space-y-2">
        <div className="relative w-full overflow-hidden rounded-lg border border-(--pw-border)">
          {src ? (
            <img
              src={src}
              alt={alt}
              width={width}
              height={height}
              className="w-full h-auto"
              loading="lazy"
            />
          ) : (
            <div className="flex h-48 items-center justify-center bg-background/10 text-sm text-foreground/50">
              No image URL provided
            </div>
          )}
        </div>
        {caption && (
          <figcaption className="text-sm text-center text-foreground/70">
            {caption}
          </figcaption>
        )}
      </figure>
    </div>
  )
}
