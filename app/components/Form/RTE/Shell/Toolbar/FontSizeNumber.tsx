"use client"

import { useCallback, useEffect, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_CRITICAL } from "lexical"
import { RTEFontSize } from "../../FontSize"
import { formatFontSize, getCurrentFontSize } from "../../actions/format"

const DEFAULT_SIZE = 16

export function FontSizeNumber() {
  const [editor] = useLexicalComposerContext()
  const [value, setValue] = useState<number>(DEFAULT_SIZE)

  const updateFontSize = useCallback((onlyWhenEditorFocused = false) => {
    if (onlyWhenEditorFocused) {
      const root = editor.getRootElement()
      if (!root?.contains(document.activeElement)) return
    }

    const size = getCurrentFontSize(editor)
    setValue(size ?? DEFAULT_SIZE)
  }, [editor])

  useEffect(() => {
    updateFontSize() // Initial sync - no focus check
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateFontSize(true) // Only sync when editor has focus (avoid overwrite on blur)
        return false
      },
      COMMAND_PRIORITY_CRITICAL
    )
  }, [editor, updateFontSize])

  const onValueChange = useCallback(
    (size: number) => {
      setValue(size)
      formatFontSize(editor, size)
      // Return focus to editor like other RTEs (Google Docs, Quill, etc.)
      queueMicrotask(() => editor.focus())
    },
    [editor]
  )

  const focusEditor = useCallback(() => {
    editor.focus()
  }, [editor])

  return (
    <RTEFontSize
      value={value}
      onValueChange={onValueChange}
      onEscape={focusEditor}
      min={8}
      max={72}
    />
  )
}
