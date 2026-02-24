"use client"
import { 
  LexicalEditor, 
  $getSelection, 
  $isRangeSelection, 
  $insertNodes,
  $createParagraphNode,
  ElementNode,
  LexicalNode,
} from "lexical"

export class HorizontalRuleNode extends ElementNode {
  insertNewAfter(): ElementNode {
    const paragraph = $createParagraphNode()
    const direction = this.getDirection()
    paragraph.setDirection(direction)
    this.insertAfter(paragraph)
    return paragraph
  }
}

export const $createHorizontalRuleNode = () => new HorizontalRuleNode()

export const $isHorizontalRuleNode = (
  node: LexicalNode | null | undefined,
): node is HorizontalRuleNode => node instanceof HorizontalRuleNode

// Horizontal rule command
export const insertHorizontalRule = (editor: LexicalEditor) =>
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return
    const hr = $createHorizontalRuleNode()
    $insertNodes([hr])
  })