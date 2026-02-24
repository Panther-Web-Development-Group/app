/** Block types supported by the RTE shell field floating menu. */
export type ShellBlockNodeType = "image" | "card" | "video" | "gallery" | "poll" | "quiz" | "slideshow" | "thumbnail" | "callout" | "table"

export interface ShellFloatingMenuRenderProps {
  nodeKey: string | null
  nodeType: ShellBlockNodeType | null
  position: { top: number; left: number } | null
}
