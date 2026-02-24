"use client"

import { useCallback } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection } from "lexical"
import { $setBlocksType } from "@lexical/selection"
import { $createHeadingNode } from "@lexical/rich-text"
import { $createParagraphNode } from "lexical"
import type { ReactNode } from "react"
import { Type, Heading1, Heading2, Heading3, Heading4 } from "lucide-react"
import { useToolbarDropdown } from "../DropdownContext"
import { cn } from "@/lib/cn"

type BlockType = "paragraph" | "h1" | "h2" | "h3" | "h4"

const OPTIONS: { value: BlockType; label: string; icon: ReactNode }[] = [
  { value: "paragraph", label: "Normal Text", icon: <Type className="h-3.5 w-3.5" /> },
  { value: "h1", label: "Heading 1", icon: <Heading1 className="h-3.5 w-3.5" /> },
  { value: "h2", label: "Heading 2", icon: <Heading2 className="h-3.5 w-3.5" /> },
  { value: "h3", label: "Heading 3", icon: <Heading3 className="h-3.5 w-3.5" /> },
  { value: "h4", label: "Heading 4", icon: <Heading4 className="h-3.5 w-3.5" /> },
]

export function BlockTypeMenu() {
  const [editor] = useLexicalComposerContext()
  const dropdown = useToolbarDropdown()

  const formatBlock = useCallback(
    (blockType: BlockType) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          if (blockType === "paragraph") {
            $setBlocksType(selection, () => $createParagraphNode())
          } else {
            $setBlocksType(selection, () => $createHeadingNode(blockType))
          }
        }
      })
      dropdown?.onClose()
    },
    [editor, dropdown]
  )

  return (
    <div className="min-w-[160px] py-1">
      {OPTIONS.map(({ value, label, icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => formatBlock(value)}
          className={cn(
            "w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors text-left",
            "hover:bg-foreground/5 dark:hover:bg-foreground/10",
            "focus:bg-foreground/5 dark:focus:bg-foreground/10 focus:outline-none"
          )}
        >
          <span className="flex h-3.5 w-3.5 items-center justify-center text-foreground/70 shrink-0">
            {icon}
          </span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
