"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect } from "react"
import { $getSelection, $isRangeSelection } from "lexical"
import { SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_CRITICAL } from "lexical"
import { useRTE } from "../../Context"
import { TEXT_FORMAT_TYPES } from "../../formatReducer"

/**
 * Syncs the current selection's text formats into RTE context (activeFormats).
 * Must run inside LexicalComposer so the editor is available.
 */
export function ActiveFormatsPlugin() {
  const [editor] = useLexicalComposerContext()
  const { dispatchFormatAction } = useRTE()

  useEffect(() => {
    const syncActiveFormats = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          dispatchFormatAction({ type: "CLEAR_COMMANDS" })
          return
        }
        const commands = TEXT_FORMAT_TYPES.filter((format) =>
          selection.hasFormat(format)
        )
        dispatchFormatAction({ type: "SET_COMMANDS", commands: [...commands] })
      })
    }

    syncActiveFormats()
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        syncActiveFormats()
        return false
      },
      COMMAND_PRIORITY_CRITICAL
    )
  }, [editor, dispatchFormatAction])

  return null
}
