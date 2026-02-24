"use client"

import { useCallback, useEffect, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_CRITICAL } from "lexical"
import { RTESelect } from "../../Select"
import { formatBlock, getBlockTypeFromSelection as getBlockTypeFromEditor } from "../../actions/format"

type BlockTypeOption = "paragraph" | "title" | "subtitle" | "h1" | "h2" | "h3" | "h4"

const BLOCK_OPTIONS = [
  { value: "paragraph" as const, label: "Paragraph", optionClassName: "text-sm font-normal" },
  { value: "title" as const, label: "Title", optionClassName: "text-2xl font-bold leading-tight" },
  { value: "subtitle" as const, label: "Subtitle", optionClassName: "text-xl font-semibold leading-snug" },
  { value: "h1" as const, label: "Heading 1", optionClassName: "text-lg font-bold leading-tight" },
  { value: "h2" as const, label: "Heading 2", optionClassName: "text-base font-bold leading-snug" },
  { value: "h3" as const, label: "Heading 3", optionClassName: "text-sm font-semibold leading-snug" },
  { value: "h4" as const, label: "Heading 4", optionClassName: "text-sm font-medium" },
]

const BLOCK_VALUES = new Set(BLOCK_OPTIONS.map((o) => o.value))

/** Resolve current block type from selection to a value we show in the select. */
function getBlockTypeFromSelection(editor: ReturnType<typeof useLexicalComposerContext>[0]): BlockTypeOption {
  const tag = getBlockTypeFromEditor(editor)
  return BLOCK_VALUES.has(tag) ? (tag as BlockTypeOption) : "paragraph"
}

export function BlockTypeSelect() {
  const [editor] = useLexicalComposerContext()
  const [value, setValue] = useState<BlockTypeOption>("paragraph")

  const syncFromSelection = useCallback((onlyWhenEditorFocused = false) => {
    if (onlyWhenEditorFocused) {
      const root = editor.getRootElement()
      if (!root?.contains(document.activeElement)) return
    }

    const next = getBlockTypeFromSelection(editor)
    setValue((prev) => (prev !== next ? next : prev))
  }, [editor])

  useEffect(() => {
    syncFromSelection() // Initial sync - no focus check
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        syncFromSelection(true) // Only sync when editor has focus (avoid overwrite on blur)
        return false
      },
      COMMAND_PRIORITY_CRITICAL
    )
  }, [editor, syncFromSelection])

  const onValueChange = useCallback(
    (next: string) => {
      if (next && BLOCK_OPTIONS.some((o) => o.value === next)) {
        setValue(next as BlockTypeOption)
        formatBlock(editor, next as BlockTypeOption)
        // Return focus to editor like other RTEs (Google Docs, Quill, etc.)
        queueMicrotask(() => editor.focus())
      }
    },
    [editor]
  )

  const focusEditor = useCallback(() => {
    editor.focus()
  }, [editor])

  return (
    <RTESelect
      value={value}
      onValueChange={onValueChange}
      onEscape={focusEditor}
      options={BLOCK_OPTIONS}
      placeholder="Block"
      triggerClassName="w-[140px]"
      contentClassName="min-w-[140px]"
    />
  )
}
