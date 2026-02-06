"use client"

import { useState } from "react"
import { FloatingMenu } from "./FloatingMenu"
import { BlockMenu } from "./BlockMenu"
import { ImageBlockMenu } from "./ImageBlockMenu"
import { CardBlockMenu } from "./CardBlockMenu"
import { VideoBlockMenu } from "./VideoBlockMenu"

export function BlockFloatingMenu() {
  const [editingNodeKey, setEditingNodeKey] = useState<string | null>(null)
  const [editingNodeType, setEditingNodeType] = useState<"image" | "card" | "video" | null>(null)

  return (
    <FloatingMenu>
      {({ nodeKey, nodeType, position }) => {
        if (!nodeKey || !nodeType || !position) return null

        // Show edit menu if editing
        if (editingNodeKey === nodeKey) {
          if (nodeType === "image") {
            return (
              <ImageBlockMenu
                nodeKey={nodeKey}
                onClose={() => {
                  setEditingNodeKey(null)
                  setEditingNodeType(null)
                }}
              />
            )
          }
          if (nodeType === "card") {
            return (
              <CardBlockMenu
                nodeKey={nodeKey}
                onClose={() => {
                  setEditingNodeKey(null)
                  setEditingNodeType(null)
                }}
              />
            )
          }
          if (nodeType === "video") {
            return (
              <VideoBlockMenu
                nodeKey={nodeKey}
                onClose={() => {
                  setEditingNodeKey(null)
                  setEditingNodeType(null)
                }}
              />
            )
          }
        }

        // Show quick action menu
        return (
          <BlockMenu
            nodeKey={nodeKey}
            nodeType={nodeType}
            onEdit={() => {
              setEditingNodeKey(nodeKey)
              setEditingNodeType(nodeType)
            }}
          />
        )
      }}
    </FloatingMenu>
  )
}
