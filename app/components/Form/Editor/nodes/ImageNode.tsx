"use client"

import {
  DecoratorNode,
  NodeKey,
  EditorConfig,
  LexicalNode,
  SerializedLexicalNode,
  Spread,
} from "lexical"
import { ImageBlockComponent } from "../components/ImageBlockComponent"
// import type { 

export type SerializedImageNode = Spread<
  {
    src: string
    alt?: string
    width?: number
    height?: number
    caption?: string
  },
  SerializedLexicalNode
>

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __alt: string
  __width?: number
  __height?: number
  __caption?: string

  static getType(): string {
    return "image"
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__alt,
      node.__width,
      node.__height,
      node.__caption,
      node.__key,
    )
  }

  constructor(
    src: string,
    alt: string = "",
    width?: number,
    height?: number,
    caption?: string,
    key?: NodeKey,
  ) {
    super(key)
    this.__src = src
    this.__alt = alt
    this.__width = width
    this.__height = height
    this.__caption = caption
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, alt, width, height, caption } = serializedNode
    return $createImageNode(src, alt || "", width, height, caption)
  }

  exportJSON(): SerializedImageNode {
    return {
      src: this.__src,
      alt: this.__alt,
      width: this.__width,
      height: this.__height,
      caption: this.__caption,
      type: "image",
      version: 1,
    }
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div")
    div.className = "editor-image-wrapper"
    return div
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    return (
      <ImageBlockComponent
        src={this.__src}
        alt={this.__alt}
        width={this.__width}
        height={this.__height}
        caption={this.__caption}
        nodeKey={this.__key}
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

  setWidth(width: number | undefined): void {
    const writable = this.getWritable()
    writable.__width = width
  }

  setHeight(height: number | undefined): void {
    const writable = this.getWritable()
    writable.__height = height
  }

  setCaption(caption: string | undefined): void {
    const writable = this.getWritable()
    writable.__caption = caption
  }
}

export function $createImageNode(
  src: string,
  alt: string = "",
  width?: number,
  height?: number,
  caption?: string,
): ImageNode {
  return new ImageNode(src, alt, width, height, caption)
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}
