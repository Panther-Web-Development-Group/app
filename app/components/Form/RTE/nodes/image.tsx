"use client"
import { JSX } from "react"

import {
  DecoratorNode,
  NodeKey,
  LexicalNode,
  SerializedLexicalNode,
  Spread
} from "lexical"

export interface ImageNodeProps {
  src: string
  alt?: string
  width?: number
  height?: number
  caption?: string
}

export type SerializedImageNode = Spread<
  ImageNodeProps,
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
    return Object.assign(div, {
      className: "editor-image-wrapper",
    })
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    // This will be implemented by the Shell block component
    return <div>Image</div>
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