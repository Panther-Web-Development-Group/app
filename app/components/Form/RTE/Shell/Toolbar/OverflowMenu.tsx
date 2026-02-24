"use client"

import { useCallback } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { ShellToolbarItem } from "./Item"
import { DropdownMenu } from "@/app/components/Form/Editor/Toolbar/DropdownMenu"
import { useToolbarDropdown } from "./DropdownContext"
import { formatCodeBlock, formatTable } from "../../actions/format"
import { MoreHorizontal, Code, Table2, Subscript, Superscript } from "lucide-react"
import { formatSubscript, formatSuperscript } from "../../actions/format"
import { cn } from "@/lib/cn"

function OverflowMenuContent() {
  const [editor] = useLexicalComposerContext()
  const dropdown = useToolbarDropdown()

  const run = useCallback(
    (fn: () => void) => {
      fn()
      dropdown?.onClose()
    },
    [dropdown]
  )

  return (
    <div className="min-w-[180px] py-1">
      <button
        type="button"
        onClick={() => run(() => formatCodeBlock(editor))}
        className={cn(
          "w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors text-left",
          "hover:bg-foreground/5 dark:hover:bg-foreground/10 focus:outline-none"
        )}
      >
        <Code className="h-3.5 w-3.5 text-foreground/70" />
        Code block
      </button>
      <button
        type="button"
        onClick={() => run(() => formatTable(editor))}
        className={cn(
          "w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors text-left",
          "hover:bg-foreground/5 dark:hover:bg-foreground/10 focus:outline-none"
        )}
      >
        <Table2 className="h-3.5 w-3.5 text-foreground/70" />
        Insert table
      </button>
      <button
        type="button"
        onClick={() => run(() => formatSubscript(editor))}
        className={cn(
          "w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors text-left",
          "hover:bg-foreground/5 dark:hover:bg-foreground/10 focus:outline-none"
        )}
      >
        <Subscript className="h-3.5 w-3.5 text-foreground/70" />
        Subscript
      </button>
      <button
        type="button"
        onClick={() => run(() => formatSuperscript(editor))}
        className={cn(
          "w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors text-left",
          "hover:bg-foreground/5 dark:hover:bg-foreground/10 focus:outline-none"
        )}
      >
        <Superscript className="h-3.5 w-3.5 text-foreground/70" />
        Superscript
      </button>
    </div>
  )
}

export function OverflowMenu() {
  return (
    <ShellToolbarItem
      id="overflow"
      type="dropdown"
      icon={<MoreHorizontal className="h-4 w-4" />}
      description="More options"
      align="right"
    >
      <OverflowMenuContent />
    </ShellToolbarItem>
  )
}
