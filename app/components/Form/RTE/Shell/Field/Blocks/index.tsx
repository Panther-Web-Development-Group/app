"use client"

import { useState } from "react"
import { FloatingMenu } from "./FloatingMenu"
import { GalleryFloatingMenu } from "./Gallery"
import { ImageFloatingMenu } from "./Image"
import { ThumbnailFloatingMenu, ThumbnailBlockMenu } from "./Thumbnail"
import { CalloutFloatingMenu } from "./Callout"
import { TableFloatingMenu } from "./Table/TableFloatingMenu"
import { PollFloatingMenu } from "./Poll"
import { QuizFloatingMenu } from "./Quiz"
import { VideoFloatingMenu } from "./Video"
import { SlideshowFloatingMenu } from "./Slideshow"
import { BlockMenu } from "@/app/components/Form/Editor/components/BlockMenu"
import { ImageBlockMenu } from "@/app/components/Form/Editor/components/ImageBlockMenu"
import { CardBlockMenu } from "@/app/components/Form/Editor/components/CardBlockMenu"
import { VideoBlockMenu } from "./Video/VideoBlockMenu"

/** RTE Shell block floating menu: quick actions + edit panels for image/card/video (and gallery when supported). */
export function ShellBlockFloatingMenu() {
  const [editingNodeKey, setEditingNodeKey] = useState<string | null>(null)

  return (
    <FloatingMenu>
      {({ nodeKey, nodeType, position }) => {
        if (!nodeKey || !nodeType || !position) return null

        // Edit mode: show block-specific edit form
        if (editingNodeKey === nodeKey) {
          if (nodeType === "image") {
            return (
              <ImageBlockMenu
                nodeKey={nodeKey}
                onClose={() => setEditingNodeKey(null)}
              />
            )
          }
          if (nodeType === "thumbnail") {
            return (
              <ThumbnailBlockMenu
                nodeKey={nodeKey}
                onClose={() => setEditingNodeKey(null)}
              />
            )
          }
          if (nodeType === "card") {
            return (
              <CardBlockMenu
                nodeKey={nodeKey}
                onClose={() => setEditingNodeKey(null)}
              />
            )
          }
          if (nodeType === "video") {
            return (
              <VideoBlockMenu
                nodeKey={nodeKey}
                onClose={() => setEditingNodeKey(null)}
              />
            )
          }
        }

        // Gallery: use RTE Gallery floating menu
        if (nodeType === "gallery") {
          return (
            <GalleryFloatingMenu
              nodeKey={nodeKey}
              onClose={() => setEditingNodeKey(null)}
              onEdit={() => setEditingNodeKey(nodeKey)}
            />
          )
        }

        // Poll: use RTE Poll floating menu
        if (nodeType === "poll") {
          return (
            <PollFloatingMenu
              nodeKey={nodeKey}
              onClose={() => setEditingNodeKey(null)}
              onEdit={() => setEditingNodeKey(nodeKey)}
            />
          )
        }

        // Quiz: use RTE Quiz floating menu
        if (nodeType === "quiz") {
          return (
            <QuizFloatingMenu
              nodeKey={nodeKey}
              onClose={() => setEditingNodeKey(null)}
              onEdit={() => setEditingNodeKey(nodeKey)}
            />
          )
        }

        // Slideshow: use RTE Slideshow floating menu
        if (nodeType === "slideshow") {
          return (
            <SlideshowFloatingMenu
              nodeKey={nodeKey}
              onClose={() => setEditingNodeKey(null)}
              onEdit={() => setEditingNodeKey(nodeKey)}
            />
          )
        }

        // Image: use RTE Image floating menu (when not in edit mode)
        if (nodeType === "image") {
          return (
            <ImageFloatingMenu
              nodeKey={nodeKey}
              onClose={() => setEditingNodeKey(null)}
              onEdit={() => setEditingNodeKey(nodeKey)}
            />
          )
        }

        // Thumbnail: use RTE Thumbnail floating menu
        if (nodeType === "thumbnail") {
          return (
            <ThumbnailFloatingMenu
              nodeKey={nodeKey}
              onClose={() => setEditingNodeKey(null)}
              onEdit={() => setEditingNodeKey(nodeKey)}
            />
          )
        }

        // Callout: use RTE Callout floating menu
        if (nodeType === "callout") {
          return (
            <CalloutFloatingMenu
              nodeKey={nodeKey}
              onClose={() => setEditingNodeKey(null)}
            />
          )
        }

        // Table: use RTE Table floating menu
        if (nodeType === "table") {
          return (
            <TableFloatingMenu
              nodeKey={nodeKey}
              onClose={() => setEditingNodeKey(null)}
            />
          )
        }

        // Video: use RTE Video floating menu (when not in edit mode)
        if (nodeType === "video") {
          return (
            <VideoFloatingMenu
              nodeKey={nodeKey}
              onClose={() => setEditingNodeKey(null)}
              onEdit={() => setEditingNodeKey(nodeKey)}
            />
          )
        }

        // Quick actions for card (only card type is handled here, others have custom menus)
        if (nodeType === "card") {
          return (
            <BlockMenu
              nodeKey={nodeKey}
              nodeType="card"
              onEdit={() => setEditingNodeKey(nodeKey)}
            />
          )
        }

        // Fallback: return null for unknown types
        return null
      }}
    </FloatingMenu>
  )
}

export { FloatingMenu } from "./FloatingMenu"
export { BlockSelectionProvider, useBlockSelection } from "./BlockSelectionContext"
export type { BlockNodeType } from "./BlockSelectionContext"
export { GalleryFloatingMenu, GalleryBlockComponent } from "./Gallery"
export type { GalleryFloatingMenuProps, GalleryBlockComponentProps } from "./Gallery"
export { ImageFloatingMenu, ImageBlockComponent } from "./Image"
export type { ImageFloatingMenuProps, ImageBlockComponentProps } from "./Image"
export { ThumbnailFloatingMenu, ThumbnailBlockComponent, ThumbnailBlockMenu } from "./Thumbnail"
export type {
  ThumbnailFloatingMenuProps,
  ThumbnailBlockComponentProps,
  ThumbnailBlockMenuProps,
} from "./Thumbnail"
export { PollFloatingMenu, PollBlockComponent } from "./Poll"
export type { PollFloatingMenuProps, PollBlockComponentProps } from "./Poll"
export { QuizFloatingMenu, QuizBlockComponent } from "./Quiz"
export type { QuizFloatingMenuProps, QuizBlockComponentProps } from "./Quiz"
export { SlideshowFloatingMenu, SlideshowBlockComponent } from "./Slideshow"
export type { SlideshowFloatingMenuProps, SlideshowBlockComponentProps } from "./Slideshow"
export { VideoFloatingMenu, VideoBlockComponent } from "./Video"
export type { VideoFloatingMenuProps, VideoBlockComponentProps } from "./Video"
export { CalloutFloatingMenu, CalloutBlockComponent } from "./Callout"
export type { CalloutFloatingMenuProps, CalloutBlockComponentProps } from "./Callout"
export { TableFloatingMenu } from "./Table/TableFloatingMenu"
export { TableHandle } from "./Table/TableHandle"
export type { ShellBlockNodeType, ShellFloatingMenuRenderProps } from "./types"
