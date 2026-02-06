"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect } from "react"
import { $getRoot, $isDecoratorNode } from "lexical"

export function DecoratorNodePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    // This plugin ensures decorator nodes are properly handled
    // The actual rendering is handled by the RichTextPlugin
    return editor.registerUpdateListener(() => {
      // Decorator nodes are automatically handled by Lexical
    })
  }, [editor])

  return null
}
