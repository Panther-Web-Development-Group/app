"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { RTERoot } from "@/app/components/Form/RTE"
import type { EditorState, LexicalEditor } from "lexical"
import { Button } from "@/app/components/Button"
import { Copy, Check } from "lucide-react"

export default function RTETestPage() {
  const [content1, setContent1] = useState<string>("")
  const [content2, setContent2] = useState<string>(
    "<p>This is <strong>pre-filled</strong> content with <em>formatting</em>.</p>"
  )
  const [content3, setContent3] = useState<string>("")
  const [resetKey, setResetKey] = useState(0)
  const [copied, setCopied] = useState(false)

  const handleChange1 = useCallback(
    (editorState: EditorState, editor: LexicalEditor, html: string) => {
      setContent1(html)
    },
    []
  )

  const handleChange2 = useCallback(
    (editorState: EditorState, editor: LexicalEditor, html: string) => {
      setContent2(html)
    },
    []
  )

  const handleChange3 = useCallback(
    (editorState: EditorState, editor: LexicalEditor, html: string) => {
      setContent3(html)
    },
    []
  )

  const handleReset = useCallback(() => {
    setResetKey((prev) => prev + 1)
  }, [])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content1 || content2 || content3)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [content1, content2, content3])

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">RTE Component Test</h1>
        <p className="text-sm text-foreground/75">
          Test page for the Rich Text Editor (RTE) component. Try out various features and
          configurations.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/examples"
            className="inline-block text-sm font-medium text-accent hover:underline"
          >
            ← Back to Examples
          </Link>
          <Button
            onClick={handleCopy}
            variant="ghost"
            size="sm"
            className="h-8 text-sm"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy HTML
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Example 1: Basic RTE */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground/90">Example 1: Basic RTE</h2>
          <p className="text-xs text-foreground/60 mt-1">
            A basic rich text editor with default toolbar items.
          </p>
        </div>
        <div className="rounded-xl border border-foreground/10 dark:border-foreground/20 bg-background/5 p-6">
          <RTERoot
            label="Basic Editor"
            placeholder="Start typing..."
            onChange={handleChange1}
            description="This is a basic rich text editor with all default formatting options."
          />
        </div>
        {content1 && (
          <div className="rounded-md bg-foreground/5 p-3 text-xs">
            <p className="font-medium mb-1">HTML Output:</p>
            <pre className="whitespace-pre-wrap break-words text-foreground/70">{content1}</pre>
          </div>
        )}
      </section>

      {/* Example 2: RTE with Initial Content */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground/90">
            Example 2: RTE with Initial Content
          </h2>
          <p className="text-xs text-foreground/60 mt-1">
            Editor pre-filled with HTML content.
          </p>
        </div>
        <div className="rounded-xl border border-foreground/10 dark:border-foreground/20 bg-background/5 p-6">
          <RTERoot
            label="Pre-filled Editor"
            placeholder="Start typing..."
            initialContent={content2}
            onChange={handleChange2}
            description="This editor starts with pre-filled content."
          />
        </div>
        {content2 && (
          <div className="rounded-md bg-foreground/5 p-3 text-xs">
            <p className="font-medium mb-1">HTML Output:</p>
            <pre className="whitespace-pre-wrap break-words text-foreground/70">{content2}</pre>
          </div>
        )}
      </section>

      {/* Example 3: RTE with Custom Toolbar Items */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground/90">
            Example 3: RTE with Custom Toolbar Items
          </h2>
          <p className="text-xs text-foreground/60 mt-1">
            Editor with only specific toolbar items enabled.
          </p>
        </div>
        <div className="rounded-xl border border-foreground/10 dark:border-foreground/20 bg-background/5 p-6">
          <RTERoot
            label="Custom Toolbar"
            placeholder="Start typing..."
            onChange={handleChange3}
            enabledToolbarItems={["bold", "italic", "underline", "list", "listOrdered"]}
            description="This editor only has bold, italic, underline, and list options."
          />
        </div>
        {content3 && (
          <div className="rounded-md bg-foreground/5 p-3 text-xs">
            <p className="font-medium mb-1">HTML Output:</p>
            <pre className="whitespace-pre-wrap break-words text-foreground/70">{content3}</pre>
          </div>
        )}
      </section>

      {/* Example 4: RTE with Required Field */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground/90">
            Example 4: Required Field
          </h2>
          <p className="text-xs text-foreground/60 mt-1">
            Editor marked as required with validation indicator.
          </p>
        </div>
        <div className="rounded-xl border border-foreground/10 dark:border-foreground/20 bg-background/5 p-6">
          <RTERoot
            label="Required Editor"
            placeholder="This field is required..."
            required
            description="This editor is marked as required."
          />
        </div>
      </section>

      {/* Example 5: RTE with Tooltip Description */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground/90">
            Example 5: Tooltip Description
          </h2>
          <p className="text-xs text-foreground/60 mt-1">
            Editor with description shown as a tooltip instead of text.
          </p>
        </div>
        <div className="rounded-xl border border-foreground/10 dark:border-foreground/20 bg-background/5 p-6">
          <RTERoot
            label="Tooltip Description"
            placeholder="Hover over the info icon..."
            description="This description appears in a tooltip when you hover over the info icon."
            descriptionType="tooltip"
          />
        </div>
      </section>

      {/* Example 6: RTE Reset Functionality */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground/90">
            Example 6: Reset Functionality
          </h2>
          <p className="text-xs text-foreground/60 mt-1">
            Editor that can be reset using the resetKey prop.
          </p>
        </div>
        <div className="rounded-xl border border-foreground/10 dark:border-foreground/20 bg-background/5 p-6">
          <div className="mb-4">
            <Button onClick={handleReset} variant="outline" size="sm">
              Reset Editor
            </Button>
          </div>
          <RTERoot
            label="Resettable Editor"
            placeholder="Type something, then click reset..."
            resetKey={resetKey}
            initialContent="<p>This content will be cleared when you click reset.</p>"
          />
        </div>
      </section>

      {/* Example 7: Minimal RTE */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground/90">Example 7: Minimal RTE</h2>
          <p className="text-xs text-foreground/60 mt-1">
            Editor without label or description, minimal configuration.
          </p>
        </div>
        <div className="rounded-xl border border-foreground/10 dark:border-foreground/20 bg-background/5 p-6">
          <RTERoot placeholder="Minimal editor..." />
        </div>
      </section>

      {/* Example 8: RTE with Custom Styling */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground/90">
            Example 8: Custom Styling
          </h2>
          <p className="text-xs text-foreground/60 mt-1">
            Editor with custom className and styling options.
          </p>
        </div>
        <div className="rounded-xl border border-foreground/10 dark:border-foreground/20 bg-background/5 p-6">
          <RTERoot
            label="Styled Editor"
            placeholder="Custom styled editor..."
            className="max-w-2xl"
            editorClassName="border-2 border-accent rounded-lg"
            contentClassName="p-6 bg-background/10"
            description="This editor has custom styling applied."
          />
        </div>
      </section>
    </div>
  )
}
