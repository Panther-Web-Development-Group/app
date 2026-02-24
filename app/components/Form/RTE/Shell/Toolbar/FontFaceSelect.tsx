"use client"

import { useCallback, useEffect, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_CRITICAL } from "lexical"
import { RTEFontCombobox, DEFAULT_FONT_OPTIONS } from "../../FontCombobox"
import { formatFontFamily, getCurrentFontFamily } from "../../actions/format"

export function FontFaceSelect() {
  const [editor] = useLexicalComposerContext()
  const [value, setValue] = useState<string>("")

  // Normalize font family value to match option values
  const normalizeFontFamily = useCallback((fontFamily: string | null): string => {
    if (!fontFamily) return ""
    
    // Try to find exact match first
    const exactMatch = DEFAULT_FONT_OPTIONS.find((opt) => opt.value === fontFamily)
    if (exactMatch) return exactMatch.value
    
    // Try to match by normalizing (remove quotes, trim)
    const normalized = fontFamily.replace(/^["']|["']$/g, "").trim()
    const normalizedMatch = DEFAULT_FONT_OPTIONS.find((opt) => {
      const optNormalized = opt.value.replace(/^["']|["']$/g, "").trim()
      return optNormalized === normalized || optNormalized.includes(normalized) || normalized.includes(optNormalized)
    })
    if (normalizedMatch) return normalizedMatch.value
    
    // Try to match CSS variables
    if (fontFamily.includes("--font-")) {
      const varMatch = DEFAULT_FONT_OPTIONS.find((opt) => opt.value.includes("--font-") && fontFamily.includes(opt.value.split("--")[1]?.split(")")[0]))
      if (varMatch) return varMatch.value
    }
    
    // Return original if no match found
    return fontFamily
  }, [])

  const updateFontFamily = useCallback((onlyWhenEditorFocused = false) => {
    if (onlyWhenEditorFocused) {
      const root = editor.getRootElement()
      if (!root?.contains(document.activeElement)) return
    }

    const fontFamily = getCurrentFontFamily(editor)
    const normalized = normalizeFontFamily(fontFamily)
    setValue(normalized)
  }, [editor, normalizeFontFamily])

  useEffect(() => {
    updateFontFamily() // Initial sync - no focus check
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateFontFamily(true) // Only sync when editor has focus (avoid overwrite on blur)
        return false
      },
      COMMAND_PRIORITY_CRITICAL
    )
  }, [editor, updateFontFamily])

  const onValueChange = useCallback(
    (next: string) => {
      setValue(next)
      formatFontFamily(editor, next || "") // "" -> formatFontFamily uses "inherit"
      // Return focus to editor like other RTEs (Google Docs, Quill, etc.)
      queueMicrotask(() => editor.focus())
    },
    [editor]
  )

  const focusEditor = useCallback(() => {
    editor.focus()
  }, [editor])

  return (
    <RTEFontCombobox
      value={value}
      onValueChange={onValueChange}
      onEscape={focusEditor}
      placeholder="Search fonts…"
      inputClassName="min-w-[8rem] w-[10rem]"
      contentClassName="min-w-[10rem]"
    />
  )
}
