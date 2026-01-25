"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from "lexical"
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link"
import {
  $isListNode,
  ListNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list"
import { $isHeadingNode, $createHeadingNode, $createQuoteNode } from "@lexical/rich-text"
import { $setBlocksType } from "@lexical/selection"
import { useCallback, useEffect, useState } from "react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
} from "lucide-react"
import { Button } from "@/app/components/Button"

const ToolbarButton = ({
  onClick,
  isActive,
  children,
  title,
}: {
  onClick: () => void
  isActive?: boolean
  children: React.ReactNode
  title?: string
}) => (
  <Button
    type="button"
    onClick={onClick}
    title={title}
    aria-pressed={isActive}
    className={`p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
      isActive ? "bg-zinc-200 dark:bg-zinc-700" : ""
    }`}
    variant="ghost"
  >
    {children}
  </Button>
)

export function Toolbar() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isCode, setIsCode] = useState(false)
  const [isLink, setIsLink] = useState(false)
  const [blockType, setBlockType] = useState<string>("paragraph")

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"))
      setIsItalic(selection.hasFormat("italic"))
      setIsUnderline(selection.hasFormat("underline"))
      setIsStrikethrough(selection.hasFormat("strikethrough"))
      setIsCode(selection.hasFormat("code"))

      const node = selection.getNodes()[0]
      const parent = node?.getParent()

      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true)
      } else {
        setIsLink(false)
      }

      if ($isHeadingNode(node)) {
        const tag = node.getTag()
        setBlockType(tag)
      } else if ($isListNode(parent)) {
        const parentList = parent
        setBlockType(parentList.getListType())
      } else {
        setBlockType("paragraph")
      }
    }
  }, [])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar()
        return false
      },
      COMMAND_PRIORITY_CRITICAL
    )
  }, [editor, updateToolbar])

  const formatHeading = (headingSize: "h1" | "h2" | "h3") => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize))
      }
    })
  }

  const formatBulletList = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes()
        const firstNode = nodes[0]
        if ($isListNode(firstNode)) {
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
        } else {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
      }
    })
  }

  const formatNumberedList = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes()
        const firstNode = nodes[0]
        if ($isListNode(firstNode)) {
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
        } else {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
      }
    })
  }

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  }

  const insertLink = () => {
    if (!isLink) {
      const url = prompt("Enter URL:")
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
      }
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    }
  }

  return (
    <div className="toolbar flex items-center gap-1 p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
      <div className="flex items-center gap-1 border-r border-zinc-300 dark:border-zinc-700 pr-2 mr-2">
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          isActive={isBold}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          isActive={isItalic}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
          isActive={isUnderline}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
          isActive={isStrikethrough}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
          isActive={isCode}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-1 border-r border-zinc-300 dark:border-zinc-700 pr-2 mr-2">
        <ToolbarButton
          onClick={() => formatHeading("h1")}
          isActive={blockType === "h1"}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => formatHeading("h2")}
          isActive={blockType === "h2"}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => formatHeading("h3")}
          isActive={blockType === "h3"}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-1 border-r border-zinc-300 dark:border-zinc-700 pr-2 mr-2">
        <ToolbarButton
          onClick={formatBulletList}
          isActive={blockType === "bullet"}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={formatNumberedList}
          isActive={blockType === "number"}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={formatQuote} isActive={blockType === "quote"} title="Quote">
          <Quote className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-1">
        <ToolbarButton onClick={insertLink} isActive={isLink} title="Link">
          <Link className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  )
}
