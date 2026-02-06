"use client"

import {
  ElementNode,
  NodeKey,
  EditorConfig,
  LexicalNode,
  SerializedLexicalNode,
  Spread,
  $createParagraphNode,
} from "lexical"

export type SerializedHorizontalRuleNode = Spread<
  {
    type: "horizontalrule"
  },
  SerializedLexicalNode
>

export class HorizontalRuleNode extends ElementNode {
  static getType(): string {
    return "horizontalrule"
  }

  static clone(node: HorizontalRuleNode): HorizontalRuleNode {
    return new HorizontalRuleNode(node.__key)
  }

  constructor(key?: NodeKey) {
    super(key)
  }

  static importJSON(serializedNode: SerializedHorizontalRuleNode): HorizontalRuleNode {
    return $createHorizontalRuleNode()
  }

  exportJSON(): SerializedHorizontalRuleNode {
    return {
      type: "horizontalrule",
      version: 1,
    }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const hr = document.createElement("hr")
    hr.className = "editor-hr my-4 border-t border-zinc-300 dark:border-zinc-700"
    return hr
  }

  updateDOM(): false {
    return false
  }

  insertNewAfter(): ElementNode {
    const paragraph = $createParagraphNode()
    const direction = this.getDirection()
    paragraph.setDirection(direction)
    this.insertAfter(paragraph)
    return paragraph
  }
}

export function $createHorizontalRuleNode(): HorizontalRuleNode {
  return new HorizontalRuleNode()
}

export function $isHorizontalRuleNode(
  node: LexicalNode | null | undefined,
): node is HorizontalRuleNode {
  return node instanceof HorizontalRuleNode
}
