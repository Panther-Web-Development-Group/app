"use client"

import { useCallback } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { ShellToolbarItem } from "./Item"
import { formatIndent, formatOutdent } from "../../actions/format"
import { Indent, Outdent } from "lucide-react"

export function IndentButtons() {
  return (
    <>
      <ShellToolbarItem
        id="indent"
        type="command"
        dispatcher={formatIndent}
        icon={<Indent className="h-4 w-4" />}
        description="Indent"
      />
      <ShellToolbarItem
        id="outdent"
        type="command"
        dispatcher={formatOutdent}
        icon={<Outdent className="h-4 w-4" />}
        description="Outdent"
      />
    </>
  )
}
