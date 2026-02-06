"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect } from "react"
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_SPACE_COMMAND,
  KEY_ENTER_COMMAND,
} from "lexical"
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text"
import { $createCodeNode } from "@lexical/code"
import { $createHorizontalRuleNode } from "../nodes/HorizontalRuleNode"
import { $setBlocksType } from "@lexical/selection"
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from "@lexical/list"

export function MarkdownShortcutsPlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const handleMarkdownShortcut = (event: KeyboardEvent) => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
        return false
      }

      const anchor = selection.anchor
      const anchorNode = anchor.getNode()
      const text = anchorNode.getTextContent()
      
      // Check for markdown patterns (without trailing space)
      const match = text.match(/^(#{1,6}|[-*+]|\d+\.|>|```|---)$/)

      if (match) {
        event.preventDefault()
        const [markdown] = match

        editor.update(() => {
          const currentSelection = $getSelection()
          if (!$isRangeSelection(currentSelection)) return

          const currentNode = currentSelection.anchor.getNode()
          const parent = currentNode.getParent()

          if (markdown.startsWith("#")) {
            const level = markdown.length as 1 | 2 | 3 | 4 | 5 | 6
            $setBlocksType(currentSelection, () => $createHeadingNode(`h${level}`))
            // Clear the markdown text
            if (currentNode.getType() === "text") {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(currentNode as any).setTextContent("")
            }
          } else if (markdown === ">") {
            $setBlocksType(currentSelection, () => $createQuoteNode())
            if (currentNode.getType() === "text") {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(currentNode as any).setTextContent("")
            }
          } else if (markdown === "```") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            $setBlocksType(currentSelection, () => $createCodeNode() as any)
            if (currentNode.getType() === "text") {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(currentNode as any).setTextContent("")
            }
          } else if (markdown === "---") {
            if (parent) {
              const hr = $createHorizontalRuleNode()
              parent.replace(hr)
              hr.selectNext()
            }
          } else if (markdown.match(/^[-*+]$/)) {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
            if (currentNode.getType() === "text") {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(currentNode as any).setTextContent("")
            }
          } else if (markdown.match(/^\d+\.$/)) {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
            if (currentNode.getType() === "text") {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(currentNode as any).setTextContent("")
            }
          }
        })

        return true
      }

      return false
    }

    const unregisterSpace = editor.registerCommand(
      KEY_SPACE_COMMAND,
      handleMarkdownShortcut,
      COMMAND_PRIORITY_LOW
    )

    const unregisterEnter = editor.registerCommand(
      KEY_ENTER_COMMAND,
      handleMarkdownShortcut,
      COMMAND_PRIORITY_LOW
    )

    return () => {
      unregisterSpace()
      unregisterEnter()
    }
  }, [editor])

  return null
}