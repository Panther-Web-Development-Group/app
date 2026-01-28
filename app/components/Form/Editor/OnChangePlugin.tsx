"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect } from "react"
import { EditorState, LexicalEditor } from "lexical"
import { $generateHtmlFromNodes } from "@lexical/html"

interface OnChangePluginProps {
  onChange?: (editorState: EditorState, editor: LexicalEditor, html: string) => void
}

export function OnChangePlugin({ onChange }: OnChangePluginProps) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        if (onChange) {
          const html = $generateHtmlFromNodes(editor, null)
          onChange(editorState, editor, html)
        }
      })
    })
  }, [editor, onChange])

  return null
}
