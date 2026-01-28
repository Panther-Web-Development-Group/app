import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListItemNode, ListNode } from "@lexical/list"
import { AutoLinkNode, LinkNode } from "@lexical/link"

export const editorConfig = {
  namespace: "lexical-editor",
  theme: {
    paragraph: "editor-paragraph",
    heading: {
      h1: "editor-heading-h1",
      h2: "editor-heading-h2",
      h3: "editor-heading-h3",
      h4: "editor-heading-h4",
    },
    list: {
      nested: {
        listitem: "editor-nested-listitem",
      },
      ol: "editor-list-ol",
      ul: "editor-list-ul",
      listitem: "editor-listitem",
    },
    link: "editor-link",
    text: {
      bold: "editor-text-bold",
      italic: "editor-text-italic",
      underline: "editor-text-underline",
      strikethrough: "editor-text-strikethrough",
      code: "editor-text-code",
    },
    code: "editor-code",
    quote: "editor-quote",
  },
  onError: (error: Error) => {
    console.error("Lexical error:", error)
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    AutoLinkNode,
    LinkNode,
  ],
  editorState: (initialContent?: string) => {
    if (initialContent) {
      try {
        // Try to parse as Lexical JSON
        const parsed = JSON.parse(initialContent)
        if (parsed && typeof parsed === "object") {
          return JSON.stringify(parsed)
        }
      } catch {
        // If not JSON, treat as HTML and convert
        return undefined // Will be handled by initialConfig
      }
    }
    return undefined
  },
}
