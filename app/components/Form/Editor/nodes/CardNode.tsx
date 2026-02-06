"use client"

import {
  DecoratorNode,
  NodeKey,
  EditorConfig,
  LexicalNode,
  SerializedLexicalNode,
  Spread,
} from "lexical"
import { CardBlockComponent } from "../components/CardBlockComponent"
import type { LexicalNode } from "lexical"

export type SerializedCardNode = Spread<
  {
    title?: string
    body?: string
    image?: {
      src: string
      alt?: string
    }
    link?: {
      href: string
      label?: string
    }
  },
  SerializedLexicalNode
>

export class CardNode extends DecoratorNode<JSX.Element> {
  __title?: string
  __body?: string
  __image?: {
    src: string
    alt?: string
  }
  __link?: {
    href: string
    label?: string
  }

  static getType(): string {
    return "card"
  }

  static clone(node: CardNode): CardNode {
    return new CardNode(
      node.__title,
      node.__body,
      node.__image,
      node.__link,
      node.__key,
    )
  }

  constructor(
    title?: string,
    body?: string,
    image?: { src: string; alt?: string },
    link?: { href: string; label?: string },
    key?: NodeKey,
  ) {
    super(key)
    this.__title = title
    this.__body = body
    this.__image = image
    this.__link = link
  }

  static importJSON(serializedNode: SerializedCardNode): CardNode {
    const { title, body, image, link } = serializedNode
    return $createCardNode(title, body, image, link)
  }

  exportJSON(): SerializedCardNode {
    return {
      title: this.__title,
      body: this.__body,
      image: this.__image,
      link: this.__link,
      type: "card",
      version: 1,
    }
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div")
    div.className = "editor-card-wrapper"
    return div
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    return (
      <CardBlockComponent
        title={this.__title}
        body={this.__body}
        image={this.__image}
        link={this.__link}
        nodeKey={this.__key}
      />
    )
  }

  setTitle(title: string | undefined): void {
    const writable = this.getWritable()
    writable.__title = title
  }

  setBody(body: string | undefined): void {
    const writable = this.getWritable()
    writable.__body = body
  }

  setImage(image: { src: string; alt?: string } | undefined): void {
    const writable = this.getWritable()
    writable.__image = image
  }

  setLink(link: { href: string; label?: string } | undefined): void {
    const writable = this.getWritable()
    writable.__link = link
  }
}

export function $createCardNode(
  title?: string,
  body?: string,
  image?: { src: string; alt?: string },
  link?: { href: string; label?: string },
): CardNode {
  return new CardNode(title, body, image, link)
}

export function $isCardNode(node: LexicalNode | null | undefined): node is CardNode {
  return node instanceof CardNode
}
