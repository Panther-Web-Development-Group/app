"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect } from "react"
import { KEY_ESCAPE_COMMAND, COMMAND_PRIORITY_LOW } from "lexical"

/**
 * Blurs the editor root when the user presses Escape.
 * Useful for dismissing focus without submitting the form.
 */
export function BlurOnEscapePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => {
        const root = editor.getRootElement()
        if (root?.contains(document.activeElement)) {
          ;(document.activeElement as HTMLElement)?.blur()
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor])

  return null
}
