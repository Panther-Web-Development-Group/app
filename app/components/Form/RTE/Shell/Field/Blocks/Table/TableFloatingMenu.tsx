"use client"

import { useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { Button } from "@/app/components/Button"
import {
  Trash2,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  MinusIcon,
} from "lucide-react"
import {
  insertTableRow,
  insertTableColumn,
  deleteTableRow,
  deleteTableColumn,
  setTableCellWidth,
} from "@/app/components/Form/RTE/actions/format"
import { cn } from "@/lib/cn"

export interface TableFloatingMenuProps {
  nodeKey: string
  onClose?: () => void
}

/** Content-only table floating menu: row/column add/delete, cell width. Position from parent FloatingMenu. */
export function TableFloatingMenu({ nodeKey, onClose }: TableFloatingMenuProps) {
  const [editor] = useLexicalComposerContext()
  const [widthInput, setWidthInput] = useState("")

  const run = (fn: () => void) => {
    fn()
  }

  const handleSetWidth = () => {
    const n = parseInt(widthInput, 10)
    if (!Number.isNaN(n) && n > 0) {
      run(() => setTableCellWidth(editor, n))
      setWidthInput("")
    }
  }

  return (
    <div className="flex flex-col gap-1 rounded-md border border-foreground/10 dark:border-foreground/20 bg-background/95 backdrop-blur-sm p-0.5 shadow-lg">
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          title="Insert row above"
          onClick={() => run(() => insertTableRow(editor, false))}
        >
          <ArrowUpIcon className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          title="Insert row below"
          onClick={() => run(() => insertTableRow(editor, true))}
        >
          <ArrowDownIcon className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          title="Delete row"
          onClick={() => run(() => deleteTableRow(editor))}
        >
          <MinusIcon className="h-3.5 w-3.5" />
        </Button>
        <span className="mx-0.5 w-px h-4 bg-foreground/15" aria-hidden />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          title="Insert column left"
          onClick={() => run(() => insertTableColumn(editor, false))}
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          title="Insert column right"
          onClick={() => run(() => insertTableColumn(editor, true))}
        >
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          title="Delete column"
          onClick={() => run(() => deleteTableColumn(editor))}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex items-center gap-1 px-1 pb-0.5">
        <input
          type="number"
          min={40}
          max={800}
          placeholder="Width (px)"
          className={cn(
            "w-20 rounded border border-foreground/15 bg-background px-1.5 py-0.5 text-xs outline-none",
            "focus:ring-1 focus:ring-foreground/20"
          )}
          value={widthInput}
          onChange={(e) => setWidthInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSetWidth()}
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs"
          onClick={handleSetWidth}
        >
          Set width
        </Button>
      </div>
    </div>
  )
}
