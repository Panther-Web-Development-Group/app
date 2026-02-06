"use client"

import { useMemo } from "react"
import { $generateHtmlFromNodes } from "@lexical/html"
import { createEditor } from "lexical"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListItemNode, ListNode } from "@lexical/list"
import { AutoLinkNode, LinkNode } from "@lexical/link"
import { ImageNode, CardNode, VideoNode } from "@/app/components/Form/Editor/nodes"
import { Image } from "@/app/components/Image"
import { Card } from "@/app/components/Card"
import { Video } from "@/app/components/Video"

interface LexicalRendererProps {
  content: any
  className?: string
}

/**
 * Sanitizes HTML content by removing document-level tags (html, head, body)
 * that would cause hydration errors when rendered inside a div
 */
function sanitizeHtml(html: string): string {
  if (!html) return ""

  let sanitized = html

  // Remove <html> and </html> tags (case-insensitive, with attributes)
  sanitized = sanitized.replace(/<html[^>]*>/gi, "")
  sanitized = sanitized.replace(/<\/html>/gi, "")

  // Remove <head> and </head> tags and their content
  sanitized = sanitized.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")

  // Remove <body> and </body> tags but keep the content
  sanitized = sanitized.replace(/<body[^>]*>/gi, "")
  sanitized = sanitized.replace(/<\/body>/gi, "")

  return sanitized.trim()
}

/**
 * Renders Lexical JSON content by converting it to HTML
 */
export function LexicalRenderer({ content, className }: LexicalRendererProps) {
  const html = useMemo(() => {
    // If content is a string, try to parse it as JSON
    let lexicalState: any = content
    if (typeof content === "string") {
      try {
        lexicalState = JSON.parse(content)
      } catch {
        // If it's not JSON, it's probably HTML - sanitize and return
        return sanitizeHtml(content)
      }
    }

    // Check if it's Lexical format (has root property)
    if (!lexicalState || typeof lexicalState !== "object" || !lexicalState.root) {
      // Not Lexical format, try to render as HTML
      if (typeof content === "string") {
        return sanitizeHtml(content)
      }
      return ""
    }

    // Render custom blocks first, then convert rest to HTML
    const renderCustomBlocks = (node: any): string => {
      if (node.type === "image") {
        const { src, alt, caption } = node
        return `<figure class="my-4"><img src="${src}" alt="${alt || ""}" class="w-full h-auto rounded-lg" /><figcaption class="text-sm text-center text-foreground/70 mt-2">${caption || ""}</figcaption></figure>`
      }
      if (node.type === "card") {
        const { title, body, image, link } = node
        let cardHtml = `<div class="my-4 rounded-lg border border-(--pw-border) bg-background/10 overflow-hidden">`
        if (image?.src) {
          cardHtml += `<div class="relative w-full aspect-video bg-background/5 overflow-hidden"><img src="${image.src}" alt="${image.alt || title || ""}" class="w-full h-full object-cover" /></div>`
        }
        cardHtml += `<div class="p-4 space-y-3">`
        if (title) cardHtml += `<h3 class="text-lg font-semibold text-foreground">${title}</h3>`
        if (body) cardHtml += `<p class="text-sm leading-6 text-foreground/75">${body}</p>`
        if (link?.href) {
          cardHtml += `<a href="${link.href}" class="text-sm font-semibold text-foreground/80 underline hover:text-foreground">${link.label || "Learn more"}</a>`
        }
        cardHtml += `</div></div>`
        return cardHtml
      }
      if (node.type === "video") {
        const { src, poster, autoplay, controls, loop, muted } = node
        return `<div class="my-4 rounded-lg border border-(--pw-border) overflow-hidden"><video src="${src}" ${poster ? `poster="${poster}"` : ""} ${autoplay ? "autoplay" : ""} ${controls ? "controls" : ""} ${loop ? "loop" : ""} ${muted ? "muted" : ""} class="w-full"></video></div>`
      }
      return ""
    }

    // Create a temporary editor to convert Lexical JSON to HTML
    try {
      const editor = createEditor({
        namespace: "lexical-renderer",
        nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, AutoLinkNode, LinkNode, ImageNode, CardNode, VideoNode],
        onError: () => {
          // Silent error handling
        },
      })

      editor.setEditable(false)

      // First, extract custom blocks and render them
      const extractAndRenderCustomBlocks = (node: any): string => {
        if (node.type === "image" || node.type === "card" || node.type === "video") {
          return renderCustomBlocks(node)
        }
        if (node.children) {
          return node.children.map(extractAndRenderCustomBlocks).join("")
        }
        return ""
      }

      const customBlocksHtml = extractAndRenderCustomBlocks(lexicalState.root)

      // Generate HTML from the editor state (this will skip decorator nodes)
      let htmlOutput = ""
      const parsedState = editor.parseEditorState(JSON.stringify(lexicalState))
      editor.setEditorState(parsedState)

      parsedState.read(() => {
        htmlOutput = $generateHtmlFromNodes(editor, null)
      })

      // Combine custom blocks HTML with regular HTML
      // Note: This is a simplified approach. For production, you'd want to properly interleave them
      return sanitizeHtml(htmlOutput + customBlocksHtml)
    } catch (error) {
      console.error("Error rendering Lexical content:", error)
      // Fallback: try to extract text content
      try {
        const extractText = (node: any): string => {
          if (node.text) return node.text
          if (node.children) {
            return node.children.map(extractText).join("")
          }
          return ""
        }
        const text = extractText(lexicalState.root)
        return text ? `<p>${text}</p>` : ""
      } catch {
        return ""
      }
    }
  }, [content])

  if (!html) {
    return <div className={className}>No content available</div>
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
