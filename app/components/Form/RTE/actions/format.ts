import { 
  $getSelection, 
  $isRangeSelection, 
  FORMAT_TEXT_COMMAND, 
  LexicalEditor,
  $insertNodes,
  $createParagraphNode,
  createCommand,
  BaseSelection,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  KEY_TAB_COMMAND,
  RangeSelection
} from "lexical"
import { 
  $isListNode,
  $isListItemNode,
  REMOVE_LIST_COMMAND, 
  INSERT_UNORDERED_LIST_COMMAND, 
  INSERT_ORDERED_LIST_COMMAND 
} from "@lexical/list"
import { 
  $setBlocksType, 
  $patchStyleText,
  $getSelectionStyleValueForProperty,
  $getComputedStyleForParent,
} from "@lexical/selection"
import { 
  $isCodeNode, 
  $createCodeNode 
} from "@lexical/code"
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  type HeadingTagType as LexicalHeadingTagType,
} from "@lexical/rich-text"
import {
  $findTableNode,
  $getTableCellNodeFromLexicalNode,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $deleteTableRowAtSelection,
  $deleteTableColumnAtSelection,
  INSERT_TABLE_COMMAND,
} from "@lexical/table"
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link"
// import { $createHorizontalRuleNode } from "../nodes/HorizontalRuleNode"

type ApplyFormatProps = {
  styleKey: string,
  styleValue: string
}

type FormatDispatcher<U extends unknown[] = []> = (editor: LexicalEditor, ...rest: U) => void
type BlockDispatcher<U extends unknown[] = []> = (selection: BaseSelection | null, ...rest: U) => void

export const APPLY_TEXT_FORMAT = createCommand<ApplyFormatProps>()

// Basic format commands
export const formatBold = (editor: LexicalEditor) => 
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")

export const formatItalic = (editor: LexicalEditor) => 
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")

export const formatUnderline = (editor: LexicalEditor) => 
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")

export const formatStrikethrough = (editor: LexicalEditor) => 
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")

export const formatSubscript = (editor: LexicalEditor) => 
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")

export const formatSuperscript = (editor: LexicalEditor) => 
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")

export const formatCode = (editor: LexicalEditor) => 
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")

// List commands
export const formatUnorderedList = (editor: LexicalEditor) => 
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return

    const nodes = selection.getNodes()
    const firstNode = nodes[0]
    if ($isListNode(firstNode)) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    }
  })

export const formatOrderedList = (editor: LexicalEditor) => 
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return

    const nodes = selection.getNodes()
    const firstNode = nodes[0]

    if ($isListNode(firstNode)) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    }
  })

// Quote commands
export const formatQuote = (editor: LexicalEditor) => 
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return

    $setBlocksType(selection, () => $createQuoteNode())
  })

// Background color command
export const formatBackground = (editor: LexicalEditor, color: string) => 
  editor.update(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) $patchStyleText(
      selection,
      { "background-color": color }
    )

    editor.dispatchCommand(APPLY_TEXT_FORMAT, {
      styleKey: "backgroundColor",
      styleValue: color
    })

    editor.focus()
  })

// Foreground color command
export const formatForeground = (editor: LexicalEditor, color: string) => 
  editor.update(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) $patchStyleText(
      selection,
      { color: color }
    )

    editor.dispatchCommand(APPLY_TEXT_FORMAT, {
      styleKey: "color",
      styleValue: color
    })

    editor.focus()
  })

// Helper to convert rgb/rgba to hex
function rgbToHex(rgb: string): string | null {
  if (rgb.startsWith("#")) return rgb
  
  const match = rgb.match(/\d+/g)
  if (!match || match.length < 3) return null
  
  const r = parseInt(match[0], 10).toString(16).padStart(2, "0")
  const g = parseInt(match[1], 10).toString(16).padStart(2, "0")
  const b = parseInt(match[2], 10).toString(16).padStart(2, "0")
  return `#${r}${g}${b}`
}

// Read current background color from selection
export const getCurrentBackgroundColor = (editor: LexicalEditor): string | null => {
  let color: string | null = null
  editor.getEditorState().read(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return
    
    const nodes = selection.getNodes()
    if (nodes.length === 0) return
    
    // Check each node's element for inline styles first
    for (const node of nodes) {
      const element = editor.getElementByKey(node.getKey())
      if (!element) continue
      
      // Check inline style first
      const inlineBg = (element as HTMLElement).style?.backgroundColor
      if (inlineBg && inlineBg !== "rgba(0, 0, 0, 0)" && inlineBg !== "transparent") {
        const hex = rgbToHex(inlineBg)
        if (hex) {
          color = hex
          return
        }
      }
      
      // Check computed style as fallback
      const computed = window.getComputedStyle(element)
      const bgColor = computed.backgroundColor
      if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent" && bgColor !== "rgb(0, 0, 0)") {
        const hex = rgbToHex(bgColor)
        if (hex && hex !== "#000000") {
          color = hex
          return
        }
      }
    }
  })
  return color
}

// Read current foreground/text color from selection
export const getCurrentForegroundColor = (editor: LexicalEditor): string | null => {
  let color: string | null = null
  editor.getEditorState().read(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return
    
    const nodes = selection.getNodes()
    if (nodes.length === 0) return
    
    // Check each node's element for inline styles first
    for (const node of nodes) {
      const element = editor.getElementByKey(node.getKey())
      if (!element) continue
      
      // Check inline style first
      const inlineColor = (element as HTMLElement).style?.color
      if (inlineColor && inlineColor !== "rgba(0, 0, 0, 0)" && inlineColor !== "transparent") {
        const hex = rgbToHex(inlineColor)
        if (hex) {
          color = hex
          return
        }
      }
      
      // Check computed style as fallback
      const computed = window.getComputedStyle(element)
      const textColor = computed.color
      if (textColor && textColor !== "rgba(0, 0, 0, 0)" && textColor !== "transparent") {
        const hex = rgbToHex(textColor)
        if (hex) {
          color = hex
          return
        }
      }
    }
  })
  return color
}

// Font size (applies to selection)
export const formatFontSize = (editor: LexicalEditor, sizePx: number) => {
  editor.focus() // Restore focus so selection is available when toolbar had focus
  editor.update(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      $patchStyleText(selection, { "font-size": `${sizePx}px` })
    }
    editor.dispatchCommand(APPLY_TEXT_FORMAT, {
      styleKey: "fontSize",
      styleValue: `${sizePx}px`,
    })
  })
}

// Font family (applies to selection)
export const formatFontFamily = (editor: LexicalEditor, fontFamily: string) => {
  editor.focus() // Restore focus so selection is available when toolbar had focus
  editor.update(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const value = fontFamily || "inherit"
      $patchStyleText(selection, { "font-family": value })
    }
    editor.dispatchCommand(APPLY_TEXT_FORMAT, {
      styleKey: "fontFamily",
      styleValue: fontFamily,
    })
  })
}

// Read current font family from selection
export const getCurrentFontFamily = (editor: LexicalEditor): string | null => {
  let fontFamily: string | null = null
  try {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      const nodes = selection.getNodes()
      if (nodes.length === 0) return

      // Check each node's element for inline styles first
      for (const node of nodes) {
        const element = editor.getElementByKey(node.getKey())
        if (!element) continue

        // Check inline style first
        const inlineFont = (element as HTMLElement).style?.fontFamily
        if (inlineFont && inlineFont !== "inherit" && inlineFont !== "") {
          fontFamily = inlineFont.replace(/^["']|["']$/g, "")
          return
        }

        // Check computed style as fallback
        const computed = window.getComputedStyle(element)
        const computedFont = computed.fontFamily
        if (computedFont && computedFont !== "inherit" && computedFont !== "") {
          const firstFont = computedFont.split(",")[0].trim().replace(/^["']|["']$/g, "")
          if (firstFont) {
            fontFamily = firstFont
            return
          }
        }
      }
    })
  } catch {
    // Selection may be invalid (e.g. after block change) - caret points lack common ancestor
    return null
  }
  return fontFamily
}

// Parse fontSize string (e.g. "16px", "1.5rem") to number
function parseFontSizePx(val: string): number | null {
  if (!val || val === "inherit") return null
  const pxMatch = val.match(/^(\d+(?:\.\d+)?)px$/i)
  if (pxMatch) return Math.round(parseFloat(pxMatch[1]))
  const remMatch = val.match(/^(\d+(?:\.\d+)?)rem$/i)
  if (remMatch) {
    const rootFontSize = typeof window !== "undefined" ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16 : 16
    return Math.round(parseFloat(remMatch[1]) * rootFontSize)
  }
  const emMatch = val.match(/^(\d+(?:\.\d+)?)em$/i)
  if (emMatch) {
    // Approximate: 1em ≈ 16px for body text
    return Math.round(parseFloat(emMatch[1]) * 16)
  }
  const numMatch = val.match(/^(\d+(?:\.\d+)?)$/)
  if (numMatch) return Math.round(parseFloat(numMatch[1]))
  return null
}

// Read current font size from selection (Lexical API first, then DOM fallback, then block type default)
export const getCurrentFontSize = (editor: LexicalEditor): number | null => {
  let fontSize: number | null = null
  try {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      // Try Lexical's built-in API first (reads from TextNode style cache)
      const styleVal = $getSelectionStyleValueForProperty(selection, "font-size", "16px")
      if (styleVal) {
        const parsed = parseFontSizePx(styleVal)
        if (parsed != null) {
          fontSize = parsed
          return
        }
      }

      // Fallback: read from DOM (for mixed/inherited styles)
      const nodes = selection.getNodes()
      if (nodes.length === 0) return

      for (const node of nodes) {
        const element = editor.getElementByKey(node.getKey())
        if (element) {
          const inlineSize = (element as HTMLElement).style?.fontSize
          if (inlineSize) {
            const parsed = parseFontSizePx(inlineSize)
            if (parsed != null) {
              fontSize = parsed
              return
            }
          }
          const computed = window.getComputedStyle(element)
          const parsed = parseFontSizePx(computed.fontSize)
          if (parsed != null) {
            fontSize = parsed
            return
          }
        }

        const parentComputed = $getComputedStyleForParent(node)
        if (parentComputed) {
          const parsed = parseFontSizePx(parentComputed.fontSize)
          if (parsed != null) {
            fontSize = parsed
            return
          }
        }
      }
    })
  } catch {
    // Selection may be invalid (e.g. after block change) - caret points lack common ancestor
  }

  // Fallback: use block type default when no explicit/inherited size found
  if (fontSize == null) {
    try {
      const blockType = getBlockTypeFromSelection(editor)
      fontSize = getDefaultFontSizeForBlockType(blockType)
    } catch {
      fontSize = 16
    }
  }
  return fontSize
}

// Block type to default font size (px) for sync with font size combobox
export const BLOCK_TYPE_DEFAULT_FONT_SIZES: Record<string, number> = {
  paragraph: 16,
  title: 40,     // 2.5rem
  subtitle: 32,  // 2rem
  h1: 32,
  h2: 24,
  h3: 19,
  h4: 16,
  h5: 13,
  h6: 11,
}

/** Get current block type from selection (paragraph | title | subtitle | h1-h6). */
export function getBlockTypeFromSelection(editor: LexicalEditor): string {
  let blockType = "paragraph"
  try {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return
      try {
        const node = selection.anchor.getNode()
        const element = node.getTopLevelElementOrThrow()
        if ($isHeadingNode(element)) {
          const tag = element.getTag()
          const styleVal = $getSelectionStyleValueForProperty(selection, "font-size", "")
          const parsed = styleVal ? parseFontSizePx(styleVal) : null
          if (tag === "h1" && parsed === BLOCK_TYPE_DEFAULT_FONT_SIZES.title) blockType = "title"
          else if (tag === "h2" && parsed === BLOCK_TYPE_DEFAULT_FONT_SIZES.subtitle) blockType = "subtitle"
          else blockType = tag in BLOCK_TYPE_DEFAULT_FONT_SIZES ? tag : "h4"
        } else {
          const styleVal = $getSelectionStyleValueForProperty(selection, "font-size", "")
          if (styleVal) {
            const parsed = parseFontSizePx(styleVal)
            if (parsed === BLOCK_TYPE_DEFAULT_FONT_SIZES.title) blockType = "title"
            else if (parsed === BLOCK_TYPE_DEFAULT_FONT_SIZES.subtitle) blockType = "subtitle"
          }
        }
      } catch {
        // no block element (e.g. table cell), keep paragraph
      }
    })
  } catch {
    // Selection may be invalid (e.g. after block change) - caret points lack common ancestor
  }
  return blockType
}

/** Get default font size for block type. Used when no explicit fontSize on selection. */
export function getDefaultFontSizeForBlockType(blockType: string): number {
  return BLOCK_TYPE_DEFAULT_FONT_SIZES[blockType] ?? 16
}

type BlockTypes =
  | "paragraph"
  | "title"
  | "subtitle"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"

type HeadingTagType = "title" | "subtitle" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

const HEADING_BLOCK_TYPES: HeadingTagType[] = [
  "title",
  "subtitle",
  "h1", "h2", 
  "h3", "h4", 
  "h5", "h6",
]

const setBlockHeading = (tag: HeadingTagType): BlockDispatcher =>
  selection => {
    if (!selection) return
    const defaultPx = BLOCK_TYPE_DEFAULT_FONT_SIZES[tag] ?? 16
    switch (tag) {
      case "title":
        // Use h1 with 2.5rem so block structure changes; $patchStyleText has issues with collapsed selection
        $setBlocksType(selection, () => $createHeadingNode("h1"))
        $patchStyleText(selection, { "font-size": "2.5rem" })
        break
      case "subtitle":
        $setBlocksType(selection, () => $createHeadingNode("h2"))
        $patchStyleText(selection, { "font-size": "2rem" })
        break
      default:
        $setBlocksType(selection, () => $createHeadingNode(tag as LexicalHeadingTagType))
        $patchStyleText(selection, { "font-size": `${defaultPx}px` }) // Sync with font size combobox
    }
  }

const blocks: Record<BlockTypes, BlockDispatcher> = {
  paragraph: selection => $setBlocksType(selection, () => $createParagraphNode()),
  ...Object.fromEntries(
    HEADING_BLOCK_TYPES.map(tag => [tag, setBlockHeading(tag)])
  ) as Record<HeadingTagType, BlockDispatcher>,
}

export const formatBlock = (editor: LexicalEditor, blockType: BlockTypes) => {
  editor.focus() // Restore focus so selection is available when toolbar had focus
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return
    if (!(blockType in blocks)) return
    blocks[blockType](selection)
  })
}

// Code block command
export const formatCodeBlock = (editor: LexicalEditor) => 
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return
    const nodes = selection.getNodes()
    const firstNode = nodes[0]
    if ($isCodeNode(firstNode)) $setBlocksType(selection, () => $createParagraphNode())
    else $setBlocksType(selection, () => $createCodeNode())
  })

const DEFAULT_TABLE_ROWS = 3
const DEFAULT_TABLE_COLUMNS = 3

type FormatTableOptions = {
  rows?: number
  cols?: number
  includeHeader?: boolean | "rows" | "columns" // default: false
}
// Table command: insert a 3×3 table (with header row) or, if selection is inside a table, replace that table with a paragraph.
export const formatTable = (editor: LexicalEditor, options: FormatTableOptions = {}) =>
  editor.update(() => {
    const selection = $getSelection()
    const { 
      rows = DEFAULT_TABLE_ROWS,
      cols = DEFAULT_TABLE_COLUMNS,
      includeHeader = false as boolean | "rows" | "columns"
    } = options
    if (!$isRangeSelection(selection)) return

    const anchorNode = selection.anchor.getNode()
    const tableNode = $findTableNode(anchorNode)

    const includeRowHeader = typeof includeHeader === "string" ? includeHeader === "rows" : includeHeader
    const includeColumnHeader = typeof includeHeader === "string" ? includeHeader === "columns" : includeHeader

    if (tableNode) {
      const paragraph = $createParagraphNode()
      tableNode.replace(paragraph)
      paragraph.selectEnd()
    } else {
      editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        rows: String(rows),
        columns: String(cols),
        includeHeaders: { rows: includeRowHeader, columns: includeColumnHeader },
      })
    }
  })

/** Inserts a table row after the current row when the selection is inside a table. No-op when not in a table. */
export const insertTableRow = (editor: LexicalEditor, insertAfter = true) =>
  editor.update(() => {
    const selection = $getSelection()
    if (!selection || !$isRangeSelection(selection)) return
    const tableNode = $findTableNode(selection.anchor.getNode())
    if (!tableNode) return
    $insertTableRowAtSelection(insertAfter)
  })

/** Deletes the current table row when the selection is inside a table. No-op when not in a table. */
export const deleteTableRow = (editor: LexicalEditor) =>
  editor.update(() => {
    const selection = $getSelection()
    if (!selection || !$isRangeSelection(selection)) return
    const tableNode = $findTableNode(selection.anchor.getNode())
    if (!tableNode) return
    $deleteTableRowAtSelection()
  })

/** Inserts a table column after the current column when the selection is inside a table. No-op when not in a table. */
export const insertTableColumn = (editor: LexicalEditor, insertAfter = true) =>
  editor.update(() => {
    const selection = $getSelection()
    if (!selection || !$isRangeSelection(selection)) return
    const tableNode = $findTableNode(selection.anchor.getNode())
    if (!tableNode) return
    $insertTableColumnAtSelection(insertAfter)
  })

/** Deletes the current table column when the selection is inside a table. No-op when not in a table. */
export const deleteTableColumn = (editor: LexicalEditor) =>
  editor.update(() => {
    const selection = $getSelection()
    if (!selection || !$isRangeSelection(selection)) return
    const tableNode = $findTableNode(selection.anchor.getNode())
    if (!tableNode) return
    $deleteTableColumnAtSelection()
  })

/** Sets the width (px) of the current table cell when the selection is inside a table. No-op when not in a table. */
export const setTableCellWidth = (editor: LexicalEditor, widthPx: number) =>
  editor.update(() => {
    const selection = $getSelection()
    if (!selection || !$isRangeSelection(selection)) return
    const cellNode = $getTableCellNodeFromLexicalNode(selection.anchor.getNode())
    if (!cellNode) return
    cellNode.getWritable().setWidth(widthPx)
  })

// Text alignment commands
export type TextAlign = "left" | "center" | "right" | "justify"

// Helper function to clear all alignments before applying a new one
const clearAlignment = (editor: LexicalEditor, selection: RangeSelection) => {
  const nodes = selection.getNodes()
  nodes.forEach((node) => {
    const element = editor.getElementByKey(node.getKey())
    if (element) {
      (element as HTMLElement).style.textAlign = ""
    }
  })
  $patchStyleText(selection, { "text-align": "" })
}

// Helper function to apply alignment
const applyAlignment = (editor: LexicalEditor, selection: RangeSelection, align: TextAlign) => {
  const nodes = selection.getNodes()
  nodes.forEach((node) => {
    const element = editor.getElementByKey(node.getKey())
    if (element) {
      (element as HTMLElement).style.textAlign = align
    }
  })
  $patchStyleText(selection, { "text-align": align })
  
  editor.dispatchCommand(APPLY_TEXT_FORMAT, {
    styleKey: "textAlign",
    styleValue: align,
  })
}

export const formatAlignLeft = (editor: LexicalEditor) =>
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return
    
    // Clear any existing alignment first
    clearAlignment(editor, selection)
    // Then apply the new alignment
    applyAlignment(editor, selection, "left")
    
    editor.focus()
  })

export const formatAlignCenter = (editor: LexicalEditor) =>
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return
    
    clearAlignment(editor, selection)
    applyAlignment(editor, selection, "center")
    
    editor.focus()
  })

export const formatAlignRight = (editor: LexicalEditor) =>
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return
    
    clearAlignment(editor, selection)
    applyAlignment(editor, selection, "right")
    
    editor.focus()
  })

export const formatAlignJustify = (editor: LexicalEditor) =>
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return
    
    clearAlignment(editor, selection)
    applyAlignment(editor, selection, "justify")
    
    editor.focus()
  })

// Remove alignment (reset to default)
export const removeAlignment = (editor: LexicalEditor) =>
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return
    
    clearAlignment(editor, selection)
    
    editor.dispatchCommand(APPLY_TEXT_FORMAT, {
      styleKey: "textAlign",
      styleValue: "",
    })
    editor.focus()
  })

// Indentation commands
const INDENT_SIZE = 40 // pixels

export const formatIndent = (editor: LexicalEditor) =>
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return
    
    const nodes = selection.getNodes()
    if (nodes.length === 0) return
    
    // Check if we're in a list item
    const firstNode = nodes[0]
    const isInListItem = $isListItemNode(firstNode) || $isListItemNode(firstNode.getParent())
    
    if (isInListItem) {
      // For lists, use Tab key command which Lexical handles natively
      editor.dispatchCommand(KEY_TAB_COMMAND, new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        bubbles: true,
        cancelable: true,
      }))
      editor.focus()
      return
    }
    
    // For non-list content, apply padding-based indentation
    nodes.forEach((node) => {
      const element = editor.getElementByKey(node.getKey())
      if (element) {
        const currentPadding = parseInt(
          (element as HTMLElement).style.paddingLeft || "0",
          10
        )
        const newPadding = currentPadding + INDENT_SIZE
        ;(element as HTMLElement).style.paddingLeft = `${newPadding}px`
      }
    })
    
    // Also apply via style text for inline formatting
    if (firstNode) {
      const element = editor.getElementByKey(firstNode.getKey())
      if (element) {
        const currentPadding = parseInt(
          (element as HTMLElement).style.paddingLeft || "0",
          10
        )
        const newPadding = currentPadding + INDENT_SIZE
        $patchStyleText(selection, { "padding-left": `${newPadding}px` })
      }
    }
    
    editor.dispatchCommand(APPLY_TEXT_FORMAT, {
      styleKey: "paddingLeft",
      styleValue: `${INDENT_SIZE}px`,
    })
    editor.focus()
  })

export const formatOutdent = (editor: LexicalEditor) =>
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return
    
    const nodes = selection.getNodes()
    if (nodes.length === 0) return
    
    // Check if we're in a list item
    const firstNode = nodes[0]
    const isInListItem = $isListItemNode(firstNode) || $isListItemNode(firstNode.getParent())
    
    if (isInListItem) {
      // For lists, dispatch Shift+Tab keyboard event which Lexical handles natively
      // Get the root element and dispatch the event
      const rootElement = editor.getRootElement()
      if (rootElement) {
        const event = new KeyboardEvent('keydown', {
          key: 'Tab',
          code: 'Tab',
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        })
        rootElement.dispatchEvent(event)
      }
      editor.focus()
      return
    }
    
    // For non-list content, apply padding-based outdentation
    nodes.forEach((node) => {
      const element = editor.getElementByKey(node.getKey())
      if (element) {
        const currentPadding = parseInt(
          (element as HTMLElement).style.paddingLeft || "0",
          10
        )
        const newPadding = Math.max(0, currentPadding - INDENT_SIZE)
        if (newPadding === 0) {
          ;(element as HTMLElement).style.paddingLeft = ""
        } else {
          ;(element as HTMLElement).style.paddingLeft = `${newPadding}px`
        }
      }
    })
    
    // Also apply via style text
    if (firstNode) {
      const element = editor.getElementByKey(firstNode.getKey())
      if (element) {
        const currentPadding = parseInt(
          (element as HTMLElement).style.paddingLeft || "0",
          10
        )
        const newPadding = Math.max(0, currentPadding - INDENT_SIZE)
        if (newPadding === 0) {
          $patchStyleText(selection, { "padding-left": "" })
        } else {
          $patchStyleText(selection, { "padding-left": `${newPadding}px` })
        }
      }
    }
    
    editor.dispatchCommand(APPLY_TEXT_FORMAT, {
      styleKey: "paddingLeft",
      styleValue: "",
    })
    editor.focus()
  })

// Link commands
export const formatLink = (editor: LexicalEditor, url: string) =>
  editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)

export const removeLink = (editor: LexicalEditor) =>
  editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)