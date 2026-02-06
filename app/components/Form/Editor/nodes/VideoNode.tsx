"use client"

import {
  DecoratorNode,
  NodeKey,
  EditorConfig,
  LexicalNode,
  SerializedLexicalNode,
  Spread,
} from "lexical"
import { VideoBlockComponent } from "../components/VideoBlockComponent"
import type { LexicalNode } from "lexical"

export type SerializedVideoNode = Spread<
  {
    src: string
    poster?: string
    autoplay?: boolean
    controls?: boolean
    loop?: boolean
    muted?: boolean
    width?: number
    height?: number
  },
  SerializedLexicalNode
>

export class VideoNode extends DecoratorNode<JSX.Element> {
  __src: string
  __poster?: string
  __autoplay?: boolean
  __controls?: boolean
  __loop?: boolean
  __muted?: boolean
  __width?: number
  __height?: number

  static getType(): string {
    return "video"
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(
      node.__src,
      node.__poster,
      node.__autoplay,
      node.__controls,
      node.__loop,
      node.__muted,
      node.__width,
      node.__height,
      node.__key,
    )
  }

  constructor(
    src: string,
    poster?: string,
    autoplay?: boolean,
    controls?: boolean,
    loop?: boolean,
    muted?: boolean,
    width?: number,
    height?: number,
    key?: NodeKey,
  ) {
    super(key)
    this.__src = src
    this.__poster = poster
    this.__autoplay = autoplay ?? true
    this.__controls = controls ?? true
    this.__loop = loop ?? false
    this.__muted = muted ?? false
    this.__width = width
    this.__height = height
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    const { src, poster, autoplay, controls, loop, muted, width, height } = serializedNode
    return $createVideoNode(src, poster, autoplay, controls, loop, muted, width, height)
  }

  exportJSON(): SerializedVideoNode {
    return {
      src: this.__src,
      poster: this.__poster,
      autoplay: this.__autoplay,
      controls: this.__controls,
      loop: this.__loop,
      muted: this.__muted,
      width: this.__width,
      height: this.__height,
      type: "video",
      version: 1,
    }
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div")
    div.className = "editor-video-wrapper"
    return div
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    return (
      <VideoBlockComponent
        src={this.__src}
        poster={this.__poster}
        autoplay={this.__autoplay}
        controls={this.__controls}
        loop={this.__loop}
        muted={this.__muted}
        width={this.__width}
        height={this.__height}
        nodeKey={this.__key}
      />
    )
  }

  setSrc(src: string): void {
    const writable = this.getWritable()
    writable.__src = src
  }

  setPoster(poster: string | undefined): void {
    const writable = this.getWritable()
    writable.__poster = poster
  }

  setAutoplay(autoplay: boolean | undefined): void {
    const writable = this.getWritable()
    writable.__autoplay = autoplay
  }

  setControls(controls: boolean | undefined): void {
    const writable = this.getWritable()
    writable.__controls = controls
  }
}

export function $createVideoNode(
  src: string,
  poster?: string,
  autoplay?: boolean,
  controls?: boolean,
  loop?: boolean,
  muted?: boolean,
  width?: number,
  height?: number,
): VideoNode {
  return new VideoNode(src, poster, autoplay, controls, loop, muted, width, height)
}

export function $isVideoNode(node: LexicalNode | null | undefined): node is VideoNode {
  return node instanceof VideoNode
}
