"use client"

import { JSX } from "react"
import {
  DecoratorNode,
  NodeKey,
  LexicalNode,
  SerializedLexicalNode,
  Spread,
} from "lexical"
import { ThumbnailBlockComponent } from "../Shell/Field/Blocks/Thumbnail"

export interface ThumbnailNodeProps {
  src: string
  alt?: string
  href?: string
  caption?: string
  /** Display width in pixels (default 160) */
  width?: number
  /** Display height in pixels (default 120) */
  height?: number
  /** Thumbnail alignment */
  alignment?: "left" | "center" | "right"
}

export type SerializedThumbnailNode = Spread<
  ThumbnailNodeProps,
  SerializedLexicalNode
>

export class ThumbnailNode extends DecoratorNode<JSX.Element> {
  __src: string
  __alt: string
  __href?: string
  __caption?: string
  __width?: number
  __height?: number
  __alignment?: "left" | "center" | "right"

  static getType(): string {
    return "thumbnail"
  }

  static clone(node: ThumbnailNode): ThumbnailNode {
    return new ThumbnailNode(
      node.__src,
      node.__alt,
      node.__href,
      node.__caption,
      node.__width,
      node.__height,
      node.__alignment,
      node.__key,
    )
  }

  constructor(
    src: string,
    alt: string = "",
    href?: string,
    caption?: string,
    width?: number,
    height?: number,
    alignment?: "left" | "center" | "right",
    key?: NodeKey,
  ) {
    super(key)
    this.__src = src
    this.__alt = alt
    this.__href = href
    this.__caption = caption
    this.__width = width
    this.__height = height
    this.__alignment = alignment
  }

  static importJSON(serializedNode: SerializedThumbnailNode): ThumbnailNode {
    const { src, alt, href, caption, width, height, alignment } = serializedNode
    return $createThumbnailNode(src, alt ?? "", href, caption, width, height, alignment)
  }

  exportJSON(): SerializedThumbnailNode {
    return {
      src: this.__src,
      alt: this.__alt,
      href: this.__href,
      caption: this.__caption,
      width: this.__width,
      height: this.__height,
      alignment: this.__alignment,
      type: "thumbnail",
      version: 1,
    }
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div")
    return Object.assign(div, {
      className: "editor-thumbnail-wrapper",
    })
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    return (
      <ThumbnailBlockComponent
        nodeKey={this.__key}
        src={this.__src}
        alt={this.__alt}
        href={this.__href}
        caption={this.__caption}
        width={this.__width}
        height={this.__height}
        alignment={this.__alignment}
      />
    )
  }

  setSrc(src: string): void {
    const writable = this.getWritable()
    writable.__src = src
  }

  setAlt(alt: string): void {
    const writable = this.getWritable()
    writable.__alt = alt
  }

  setHref(href: string | undefined): void {
    const writable = this.getWritable()
    writable.__href = href
  }

  setCaption(caption: string | undefined): void {
    const writable = this.getWritable()
    writable.__caption = caption
  }

  setWidth(width: number | undefined): void {
    const writable = this.getWritable()
    writable.__width = width
  }

  setHeight(height: number | undefined): void {
    const writable = this.getWritable()
    writable.__height = height
  }

  setAlignment(alignment: "left" | "center" | "right"): void {
    const writable = this.getWritable()
    writable.__alignment = alignment
  }
}

export function $createThumbnailNode(
  src: string,
  alt: string = "",
  href?: string,
  caption?: string,
  width?: number,
  height?: number,
  alignment?: "left" | "center" | "right",
): ThumbnailNode {
  return new ThumbnailNode(src, alt, href, caption, width, height, alignment)
}

export function $isThumbnailNode(
  node: LexicalNode | null | undefined,
): node is ThumbnailNode {
  return node instanceof ThumbnailNode
}
