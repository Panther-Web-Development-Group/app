"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from "lexical"
import { $isLinkNode } from "@lexical/link"
import {
  $isListNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list"
import { $isHeadingNode, $createHeadingNode, $createQuoteNode } from "@lexical/rich-text"
import { $isCodeNode, $createCodeNode } from "@lexical/code"
import { $setBlocksType } from "@lexical/selection"
import { $createParagraphNode, $insertNodes } from "lexical"
import { useCallback, useEffect, useState, useMemo } from "react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Code2,
  List,
  ListOrdered,
  Quote,
  MoreHorizontal,
  Minus,
  Type,
} from "lucide-react"
import { Select, SelectTrigger, SelectContent, SelectOption } from "@/app/components/Form/Select"
import { LinkDropdown } from "./LinkDropdown"
import { ImageDropdown } from "./ImageDropdown"
import { CardDropdown } from "./CardDropdown"
import { VideoDropdown } from "./VideoDropdown"
import { $createHorizontalRuleNode } from "../nodes/HorizontalRuleNode"
import { DropdownMenu } from "./DropdownMenu"
import { ToolbarButton } from "./ToolbarButton"
import { cn } from "@/lib/cn"

export function Toolbar() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isCode, setIsCode] = useState(false)
  const [isLink, setIsLink] = useState(false)
  const [blockType, setBlockType] = useState<string>("paragraph")
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false)

  const selectValue = useMemo(() => {
    if (
      blockType === "paragraph" ||
      blockType === "h1" ||
      blockType === "h2" ||
      blockType === "h3" ||
      blockType === "h4"
    ) {
      return blockType
    }
    return "paragraph"
  }, [blockType])

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"))
      setIsItalic(selection.hasFormat("italic"))
      setIsUnderline(selection.hasFormat("underline"))
      setIsStrikethrough(selection.hasFormat("strikethrough"))
      setIsCode(selection.hasFormat("code"))

      const nodes = selection.getNodes()
      const node = nodes[0]
      const parent = node?.getParent()

      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true)
      } else {
        setIsLink(false)
      }

      if (!node) {
        setBlockType("paragraph")
        return
      }

      try {
        if ($isHeadingNode(node)) {
          const tag = node.getTag()
          setBlockType(tag)
        } else if ($isCodeNode(node)) {
          setBlockType("code")
        } else if (parent && $isListNode(parent)) {
          const listType = parent.getListType()
          if (listType) {
            setBlockType(listType)
          } else {
            setBlockType("paragraph")
          }
        } else {
          setBlockType("paragraph")
        }
      } catch (error) {
        // Fallback to paragraph if there's any error determining block type
        console.warn("Error determining block type:", error)
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

  const formatBlock = useCallback(
    (blockType: "paragraph" | "h1" | "h2" | "h3" | "h4") => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          if (blockType === "paragraph") {
            $setBlocksType(selection, () => $createParagraphNode())
          } else {
            $setBlocksType(selection, () => $createHeadingNode(blockType))
          }
        }
      })
    },
    [editor]
  )

  const formatBulletList = useCallback(() => {
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
  }, [editor])

  const formatNumberedList = useCallback(() => {
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
  }, [editor])

  const formatQuote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  }, [editor])

  const formatCodeBlock = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes()
        const firstNode = nodes[0]
        if ($isCodeNode(firstNode)) {
          // Convert code block back to paragraph
          $setBlocksType(selection, () => $createParagraphNode())
        } else {
          // Convert to code block
          $setBlocksType(selection, () => $createCodeNode())
        }
      }
    })
  }, [editor])

  const insertHorizontalRule = useCallback(() => {
    editor.update(() => {
      const hr = $createHorizontalRuleNode()
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $insertNodes([hr])
      }
    })
  }, [editor])

  return (
    <div
      className={cn(
        "toolbar flex max-w-full items-center gap-0.5",
        "border-b border-foreground/10 dark:border-foreground/20",
        "bg-background/50 backdrop-blur-sm",
        "z-1000"
      )}
    >
      {/* Block type selector - always visible */}
      <div className="flex items-center gap-0.5 border-r border-foreground/10 dark:border-foreground/20 shrink-0">
        <Select
          value={selectValue}
          onValueChange={(value) => {
            if (
              typeof value === "string" &&
              (value === "paragraph" ||
                value === "h1" ||
                value === "h2" ||
                value === "h3" ||
                value === "h4")
            ) {
              formatBlock(value as "paragraph" | "h1" | "h2" | "h3" | "h4")
            }
          }}
          className="min-w-[140px] border-none"
        >
          <SelectTrigger
            className={cn(
              "h-10 w-full border-none py-4 px-2.5 text-sm rounded-none",
              "hover:bg-foreground/5 dark:hover:bg-foreground/10",
              "focus-visible:ring-2 focus-visible:ring-foreground/20"
            )}
          />
          <SelectContent className="z-9999">
            <SelectOption value="paragraph">
              <span className="flex items-center gap-2">
                <Type className="h-3.5 w-3.5" />
                Normal Text
              </span>
            </SelectOption>
            <SelectOption value="h1">Heading 1</SelectOption>
            <SelectOption value="h2">Heading 2</SelectOption>
            <SelectOption value="h3">Heading 3</SelectOption>
            <SelectOption value="h4">Heading 4</SelectOption>
          </SelectContent>
        </Select>
      </div>

      {/* Text formatting - always visible core, rest in overflow */}
      <div className="flex items-center gap-0.5 border-r border-foreground/10 dark:border-foreground/20 p-1.5 mr-1.5 shrink-0">
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          isActive={isBold}
          title="Bold (Ctrl+B)"
          size="md"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          isActive={isItalic}
          title="Italic (Ctrl+I)"
          size="md"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
          isActive={isUnderline}
          title="Underline (Ctrl+U)"
          size="md"
          className="hidden sm:flex"
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
          isActive={isStrikethrough}
          title="Strikethrough"
          size="md"
          className="hidden lg:flex"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
          isActive={isCode}
          title="Inline Code"
          size="md"
          className="hidden lg:flex"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Lists and blocks - visible on larger screens */}
      <div className="hidden md:flex items-center gap-0.5 border-r border-foreground/10 dark:border-foreground/20 p-1.5 mr-1.5 shrink-0">
        <ToolbarButton
          onClick={formatBulletList}
          isActive={blockType === "bullet"}
          title="Bullet List"
          size="md"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={formatNumberedList}
          isActive={blockType === "number"}
          title="Numbered List"
          size="md"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={formatQuote}
          isActive={blockType === "quote"}
          title="Quote"
          size="md"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={formatCodeBlock}
          isActive={blockType === "code"}
          title="Code Block"
          size="md"
        >
          <Code2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Link - visible on larger screens */}
      <div className="hidden md:flex items-center gap-0.5 border-r border-foreground/10 dark:border-foreground/20 pr-1.5 mr-1.5 shrink-0">
        <LinkDropdown isActive={isLink} />
      </div>

      {/* Media - visible on larger screens */}
      <div className="hidden md:flex items-center gap-0.5 border-r border-foreground/10 dark:border-foreground/20 pr-1.5 mr-1.5 shrink-0">
        <ImageDropdown />
        <CardDropdown />
        <VideoDropdown />
      </div>

      {/* Horizontal rule - visible on larger screens */}
      <div className="hidden md:flex items-center gap-0.5 shrink-0">
        <ToolbarButton onClick={insertHorizontalRule} title="Insert Horizontal Rule" size="md">
          <Minus className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Overflow menu for mobile and smaller screens */}
      <div className="md:hidden shrink-0 ml-auto">
        <DropdownMenu
          trigger={<MoreHorizontal className="h-4 w-4" />}
          title="More options"
          open={overflowMenuOpen}
          onOpenChange={setOverflowMenuOpen}
          items={[
            {
              label: "Underline",
              icon: <Underline className="h-4 w-4" />,
              onClick: () => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
                setOverflowMenuOpen(false)
              },
            },
            {
              label: "Strikethrough",
              icon: <Strikethrough className="h-4 w-4" />,
              onClick: () => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
                setOverflowMenuOpen(false)
              },
            },
            {
              label: "Inline Code",
              icon: <Code className="h-4 w-4" />,
              onClick: () => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")
                setOverflowMenuOpen(false)
              },
            },
            { separator: true },
            {
              label: "Bullet List",
              icon: <List className="h-4 w-4" />,
              onClick: () => {
                formatBulletList()
                setOverflowMenuOpen(false)
              },
            },
            {
              label: "Numbered List",
              icon: <ListOrdered className="h-4 w-4" />,
              onClick: () => {
                formatNumberedList()
                setOverflowMenuOpen(false)
              },
            },
            {
              label: "Quote",
              icon: <Quote className="h-4 w-4" />,
              onClick: () => {
                formatQuote()
                setOverflowMenuOpen(false)
              },
            },
            {
              label: "Code Block",
              icon: <Code2 className="h-4 w-4" />,
              onClick: () => {
                formatCodeBlock()
                setOverflowMenuOpen(false)
              },
            },
            { separator: true },
            {
              label: "Horizontal Rule",
              onClick: () => {
                insertHorizontalRule()
                setOverflowMenuOpen(false)
              },
            },
          ]}
        >
          <div className="p-2 space-y-1">
            <div className="text-xs font-semibold text-foreground/70 px-2 py-1">Insert</div>
            <div className="flex flex-col gap-1">
              <LinkDropdown isActive={isLink} />
              <ImageDropdown />
              <CardDropdown />
              <VideoDropdown />
            </div>
          </div>
        </DropdownMenu>
      </div>
    </div>
  )
}
