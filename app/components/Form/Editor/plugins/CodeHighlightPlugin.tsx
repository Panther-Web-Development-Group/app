"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $isCodeNode, CodeNode } from "@lexical/code"
import { useEffect } from "react"
import { $getRoot, $isElementNode } from "lexical"
import Prism from "prismjs"

// Import Prism CSS - you may want to customize this
import "prismjs/themes/prism-tomorrow.css"
// Import common languages
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-tsx"
import "prismjs/components/prism-css"
import "prismjs/components/prism-json"
import "prismjs/components/prism-markdown"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-python"
import "prismjs/components/prism-java"
import "prismjs/components/prism-sql"

export function CodeHighlightPlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const updateCodeHighlighting = () => {
      editor.getEditorState().read(() => {
        const root = $getRoot()
        const codeNodes: CodeNode[] = []
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function traverse(node: any) {
          if ($isCodeNode(node)) {
            codeNodes.push(node as CodeNode)
          }
          if ($isElementNode(node)) {
            const children = node.getChildren()
            for (const child of children) {
              traverse(child)
            }
          }
        }

        traverse(root)

        // Use setTimeout to ensure DOM is updated
        setTimeout(() => {
          for (const codeNode of codeNodes) {
            const element = editor.getElementByKey(codeNode.getKey())
            if (element) {
              const code = codeNode.getTextContent()
              // Try to get language from the code node, fallback to detecting from class or default to javascript
              let language = "javascript"
              try {
                // Try to detect from existing class first
                const pre = element.querySelector("pre")
                if (pre) {
                  const codeElement = pre.querySelector("code")
                  if (codeElement) {
                    const existingClass = codeElement.className
                    const langMatch = existingClass.match(/language-(\w+)/)
                    if (langMatch) {
                      language = langMatch[1]
                    }
                  }
                }
                // CodeNode might have getLanguage method or language property
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const codeNodeAny = codeNode as any
                if (typeof codeNodeAny.getLanguage === "function") {
                  const detectedLang = codeNodeAny.getLanguage()
                  if (detectedLang) {
                    language = detectedLang
                  }
                } else if (codeNodeAny.__language) {
                  language = codeNodeAny.__language
                }
              } catch {
                // Default to javascript
                language = "javascript"
              }
              
              try {
                const grammar = Prism.languages[language] || Prism.languages.javascript
                const highlighted = Prism.highlight(code, grammar, language)
                const pre = element.querySelector("pre")
                if (pre) {
                  const codeElement = pre.querySelector("code")
                  if (codeElement) {
                    codeElement.innerHTML = highlighted
                    codeElement.className = `language-${language}`
                  }
                }
              } catch (error) {
                // If highlighting fails, just use the plain text
                console.warn("Failed to highlight code:", error)
              }
            }
          }
        }, 0)
      })
    }

    // Initial highlight
    updateCodeHighlighting()

    // Update on editor changes
    return editor.registerUpdateListener(() => {
      updateCodeHighlighting()
    })
  }, [editor])

  return null
}
