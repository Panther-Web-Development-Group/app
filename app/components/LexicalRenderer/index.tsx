"use client"

import { useMemo } from "react"
import { $generateHtmlFromNodes } from "@lexical/html"
import { createEditor } from "lexical"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListItemNode, ListNode } from "@lexical/list"
import { AutoLinkNode, LinkNode } from "@lexical/link"

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

    // Create a temporary editor to convert Lexical JSON to HTML
    try {
      const editor = createEditor({
        namespace: "lexical-renderer",
        nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, AutoLinkNode, LinkNode],
        onError: () => {
          // Silent error handling
        },
      })

      editor.setEditable(false)

      // Generate HTML from the editor state
      let htmlOutput = ""
      const parsedState = editor.parseEditorState(JSON.stringify(lexicalState))
      editor.setEditorState(parsedState)

      parsedState.read(() => {
        htmlOutput = $generateHtmlFromNodes(editor, null)
      })

      return sanitizeHtml(htmlOutput)
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
