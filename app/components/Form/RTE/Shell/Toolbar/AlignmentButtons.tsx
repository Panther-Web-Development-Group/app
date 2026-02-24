"use client"

import { useCallback, useEffect, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_CRITICAL, $getSelection, $isRangeSelection } from "lexical"
import { ShellToolbarButton } from "./Button"
import { formatAlignLeft, formatAlignCenter, formatAlignRight, formatAlignJustify, removeAlignment } from "../../actions/format"
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react"

export function AlignmentButtons() {
  const [editor] = useLexicalComposerContext()
  const [currentAlign, setCurrentAlign] = useState<"left" | "center" | "right" | "justify" | null>(null)

  const updateAlignment = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        setCurrentAlign(null)
        return
      }

      const nodes = selection.getNodes()
      if (nodes.length === 0) {
        setCurrentAlign(null)
        return
      }

      // Check alignment of all nodes - only set active if all nodes have the same alignment
      let commonAlign: "left" | "center" | "right" | "justify" | null = null
      
      for (const node of nodes) {
        const element = editor.getElementByKey(node.getKey())
        if (!element) {
          setCurrentAlign(null)
          return
        }
        
        const textAlign = (element as HTMLElement).style.textAlign || window.getComputedStyle(element).textAlign
        let nodeAlign: "left" | "center" | "right" | "justify" | null = null
        
        if (textAlign === "left" || textAlign === "start") {
          nodeAlign = "left"
        } else if (textAlign === "center") {
          nodeAlign = "center"
        } else if (textAlign === "right" || textAlign === "end") {
          nodeAlign = "right"
        } else if (textAlign === "justify") {
          nodeAlign = "justify"
        }
        
        // If this is the first node, set commonAlign
        if (commonAlign === null) {
          commonAlign = nodeAlign
        } else if (commonAlign !== nodeAlign) {
          // If alignments differ, no single alignment is active
          setCurrentAlign(null)
          return
        }
      }
      
      setCurrentAlign(commonAlign)
    })
  }, [editor])

  useEffect(() => {
    updateAlignment()
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateAlignment()
        return false
      },
      COMMAND_PRIORITY_CRITICAL
    )
  }, [editor, updateAlignment])

  const handleAlignLeft = useCallback(() => {
    if (currentAlign === "left") {
      removeAlignment(editor)
    } else {
      formatAlignLeft(editor)
    }
  }, [editor, currentAlign])

  const handleAlignCenter = useCallback(() => {
    if (currentAlign === "center") {
      removeAlignment(editor)
    } else {
      formatAlignCenter(editor)
    }
  }, [editor, currentAlign])

  const handleAlignRight = useCallback(() => {
    if (currentAlign === "right") {
      removeAlignment(editor)
    } else {
      formatAlignRight(editor)
    }
  }, [editor, currentAlign])

  const handleAlignJustify = useCallback(() => {
    if (currentAlign === "justify") {
      removeAlignment(editor)
    } else {
      formatAlignJustify(editor)
    }
  }, [editor, currentAlign])

  return (
    <>
      <ShellToolbarButton
        onClick={handleAlignLeft}
        title="Align left"
        isActive={currentAlign === "left"}
      >
        <AlignLeft className="h-4 w-4" />
      </ShellToolbarButton>
      <ShellToolbarButton
        onClick={handleAlignCenter}
        title="Align center"
        isActive={currentAlign === "center"}
      >
        <AlignCenter className="h-4 w-4" />
      </ShellToolbarButton>
      <ShellToolbarButton
        onClick={handleAlignRight}
        title="Align right"
        isActive={currentAlign === "right"}
      >
        <AlignRight className="h-4 w-4" />
      </ShellToolbarButton>
      <ShellToolbarButton
        onClick={handleAlignJustify}
        title="Justify"
        isActive={currentAlign === "justify"}
      >
        <AlignJustify className="h-4 w-4" />
      </ShellToolbarButton>
    </>
  )
}
