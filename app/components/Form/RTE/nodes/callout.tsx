"use client"

import { JSX } from "react"
import {
  DecoratorNode,
  NodeKey,
  LexicalNode,
  SerializedLexicalNode,
  Spread,
} from "lexical"
import { CalloutBlockComponent } from "../Shell/Field/Blocks/Callout"

export type CalloutVariant = "info" | "warning" | "tip"

export interface CalloutNodeProps {
  variant: CalloutVariant
  title?: string
  body: string
}

export type SerializedCalloutNode = Spread<
  CalloutNodeProps,
  SerializedLexicalNode
>

export class CalloutNode extends DecoratorNode<JSX.Element> {
  __variant: CalloutVariant
  __title?: string
  __body: string

  static getType(): string {
    return "callout"
  }

  static clone(node: CalloutNode): CalloutNode {
    return new CalloutNode(
      node.__variant,
      node.__title,
      node.__body,
      node.__key
    )
  }

  constructor(
    variant: CalloutVariant,
    title?: string,
    body: string = "",
    key?: NodeKey
  ) {
    super(key)
    this.__variant = variant
    this.__title = title
    this.__body = body
  }

  static importJSON(serializedNode: SerializedCalloutNode): CalloutNode {
    const { variant, title, body } = serializedNode
    return $createCalloutNode(variant, title, body ?? "")
  }

  exportJSON(): SerializedCalloutNode {
    return {
      variant: this.__variant,
      title: this.__title,
      body: this.__body,
      type: "callout",
      version: 1,
    }
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div")
    return Object.assign(div, {
      className: "editor-callout-wrapper",
    })
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    return (
      <CalloutBlockComponent
        nodeKey={this.__key}
        variant={this.__variant}
        title={this.__title}
        body={this.__body}
      />
    )
  }

  setVariant(variant: CalloutVariant): void {
    const writable = this.getWritable()
    writable.__variant = variant
  }

  setTitle(title: string | undefined): void {
    const writable = this.getWritable()
    writable.__title = title
  }

  setBody(body: string): void {
    const writable = this.getWritable()
    writable.__body = body
  }
}

export function $createCalloutNode(
  variant: CalloutVariant,
  title?: string,
  body: string = ""
): CalloutNode {
  return new CalloutNode(variant, title, body)
}

export function $isCalloutNode(
  node: LexicalNode | null | undefined
): node is CalloutNode {
  return node instanceof CalloutNode
}
