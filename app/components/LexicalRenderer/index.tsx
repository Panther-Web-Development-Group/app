"use client"

import { useMemo } from "react"
import { $generateHtmlFromNodes } from "@lexical/html"
import { createEditor } from "lexical"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListItemNode, ListNode } from "@lexical/list"
import { AutoLinkNode, LinkNode } from "@lexical/link"
import { ImageNode, CardNode, VideoNode } from "@/app/components/Form/Editor/nodes"
import { ThumbnailNode } from "@/app/components/Form/RTE/nodes/thumbnail"
import { CalloutNode } from "@/app/components/Form/RTE/nodes/callout"

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
 * Normalizes content to full Lexical editor state format.
 * Editors may store root.exportJSON() (root node only) or full { root: {...} }.
 */
function normalizeLexicalState(parsed: any): { root: any } | null {
  if (!parsed || typeof parsed !== "object") return null
  if (parsed.root && typeof parsed.root === "object") return parsed
  // Root-only format: { type: 'root', children: [...] } from root.exportJSON()
  if (parsed.type === "root" && Array.isArray(parsed.children)) {
    return { root: parsed }
  }
  return null
}

/**
 * Renders Lexical JSON content by converting it to HTML
 */
export function LexicalRenderer({ content, className }: LexicalRendererProps) {
  const html = useMemo(() => {
    // If content is a string, try to parse it as JSON
    let parsed: any = content
    if (typeof content === "string") {
      try {
        parsed = JSON.parse(content)
      } catch {
        // If it's not JSON, it's probably HTML - sanitize and return
        return sanitizeHtml(content)
      }
    }

    // Handle object with html property (e.g. { type: "richText", html: "..." })
    if (parsed && typeof parsed === "object" && typeof parsed.html === "string") {
      return sanitizeHtml(parsed.html)
    }

    // Normalize to full Lexical format (handles root-only storage)
    const lexicalState = normalizeLexicalState(parsed)
    if (!lexicalState) {
      if (typeof content === "string") return sanitizeHtml(content)
      return ""
    }

    // Render custom/decorator blocks to HTML
    const renderCustomBlocks = (node: any): string => {
      if (node.type === "image") {
        const { src, alt, caption } = node
        const escapedAlt = (alt || "").replace(/"/g, "&quot;")
        const escapedCaption = (caption || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        return `<figure class="my-4"><img src="${src}" alt="${escapedAlt}" class="w-full h-auto rounded-lg" /><figcaption class="text-sm text-center text-foreground/70 mt-2">${escapedCaption}</figcaption></figure>`
      }
      if (node.type === "card") {
        const { title, body, image, link } = node
        const escapedTitle = (title || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        const escapedBody = (body || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        let cardHtml = `<div class="my-4 rounded-lg border border-(--pw-border) bg-background/10 overflow-hidden">`
        if (image?.src) {
          cardHtml += `<div class="relative w-full aspect-video bg-background/5 overflow-hidden"><img src="${image.src}" alt="${(image.alt || title || "").replace(/"/g, "&quot;")}" class="w-full h-full object-cover" /></div>`
        }
        cardHtml += `<div class="p-4 space-y-3">`
        if (title) cardHtml += `<h3 class="text-lg font-semibold text-foreground">${escapedTitle}</h3>`
        if (body) cardHtml += `<p class="text-sm leading-6 text-foreground/75">${escapedBody}</p>`
        if (link?.href) {
          const linkLabel = (link.label || "Learn more").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          cardHtml += `<a href="${link.href}" class="text-sm font-semibold text-foreground/80 underline hover:text-foreground">${linkLabel}</a>`
        }
        cardHtml += `</div></div>`
        return cardHtml
      }
      if (node.type === "video") {
        const { src, poster, autoplay, controls, loop, muted } = node
        return `<div class="my-4 rounded-lg border border-(--pw-border) overflow-hidden"><video src="${src}" ${poster ? `poster="${poster}"` : ""} ${autoplay ? "autoplay" : ""} ${controls ? "controls" : ""} ${loop ? "loop" : ""} ${muted ? "muted" : ""} class="w-full"></video></div>`
      }
      if (node.type === "thumbnail") {
        const { src, alt, href, caption, width, height, alignment } = node
        const escapedAlt = (alt || "").replace(/"/g, "&quot;")
        const escapedCaption = (caption || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        const alignClass = alignment === "center" ? "mx-auto" : alignment === "right" ? "ml-auto" : ""
        const style = width || height ? ` style="${width ? `width:${width}px` : ""}${width && height ? ";" : ""}${height ? `height:${height}px` : ""}"` : ""
        const img = `<img src="${src}" alt="${escapedAlt}" class="w-full h-auto rounded-lg border border-(--pw-border)"${style} loading="lazy" />`
        const wrapped = href ? `<a href="${href}" class="block">${img}</a>` : img
        return `<figure class="my-4 ${alignClass}" style="max-width:${width || 160}px">${wrapped}${caption ? `<figcaption class="text-xs text-foreground/70 mt-1">${escapedCaption}</figcaption>` : ""}</figure>`
      }
      if (node.type === "callout") {
        const { variant, title, body } = node
        const variantStyles: Record<string, string> = {
          info: "border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10",
          warning: "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10",
          tip: "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10",
        }
        const variantIcons: Record<string, string> = {
          info: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
          warning: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
          tip: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
        }
        const style = variantStyles[variant || "info"] || variantStyles.info
        const iconStyle = variantIcons[variant || "info"] || variantIcons.info
        const escapedTitle = (title || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        const escapedBody = (body || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        return `<div class="my-4 rounded-lg border p-4 ${style}"><div class="flex gap-3"><div class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconStyle}">ℹ</div><div><div class="font-semibold text-foreground">${escapedTitle || "Note"}</div><p class="mt-1 text-sm text-foreground/80">${escapedBody}</p></div></div></div>`
      }
      return ""
    }

    // Create a temporary editor to convert Lexical JSON to HTML
    try {
      const editor = createEditor({
        namespace: "lexical-renderer",
        nodes: [
          HeadingNode,
          ListNode,
          ListItemNode,
          QuoteNode,
          AutoLinkNode,
          LinkNode,
          ImageNode,
          CardNode,
          VideoNode,
          ThumbnailNode,
          CalloutNode,
        ],
        onError: () => {
          // Silent error handling
        },
      })

      editor.setEditable(false)

      // Extract and render custom/decorator blocks (image, card, video, thumbnail, callout)
      const extractAndRenderCustomBlocks = (node: any): string => {
        if (
          node.type === "image" ||
          node.type === "card" ||
          node.type === "video" ||
          node.type === "thumbnail" ||
          node.type === "callout"
        ) {
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
