"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect } from "react"
import { $getRoot } from "lexical"
import { mergeRegister } from "@lexical/utils"
import {
  KEY_ENTER_COMMAND,
  PASTE_COMMAND,
  CONTROLLED_TEXT_INSERTION_COMMAND,
} from "lexical"
import { COMMAND_PRIORITY_HIGH } from "lexical"

function getEditorTextLength(editor: ReturnType<typeof useLexicalComposerContext>[0]): number {
  let length = 0
  editor.getEditorState().read(() => {
    const root = $getRoot()
    length = root.getTextContentSize()
  })
  return length
}

export interface MaxLengthPluginProps {
  /** Max character count (text content). When 0 or undefined, the plugin does nothing. */
  maxLength?: number
}

/**
 * Enforces a maximum character count (root text content size).
 * Prevents typing, paste, and enter when at or over the limit.
 */
export function MaxLengthPlugin({ maxLength = 0 }: MaxLengthPluginProps) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!maxLength || maxLength <= 0) return () => {}

    const preventIfAtLimit = () => getEditorTextLength(editor) >= maxLength

    return mergeRegister(
      editor.registerCommand(
        CONTROLLED_TEXT_INSERTION_COMMAND,
        () => preventIfAtLimit(),
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        PASTE_COMMAND,
        () => preventIfAtLimit(),
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        () => preventIfAtLimit(),
        COMMAND_PRIORITY_HIGH
      )
    )
  }, [editor, maxLength])

  return null
}
