"use client"

import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin"
import { $getRoot, EditorState, LexicalEditor } from "lexical"
import { useRef } from "react"
import { Toolbar } from "./Toolbar"
import { editorConfig } from "./config"
import { $generateHtmlFromNodes } from "@lexical/html"
import { OnChangePlugin } from "./OnChangePlugin"

interface EditorProps {
  initialContent?: string | null
  onChange?: (editorState: EditorState, editor: LexicalEditor, html: string) => void
  placeholder?: string
  className?: string
}

export function Editor({ initialContent, onChange, placeholder, className }: EditorProps) {
  const editorRef = useRef<LexicalEditor | null>(null)

  const initialConfig = {
    ...editorConfig,
    editorState: initialContent || undefined,
    namespace: "lexical-editor",
  }

  return (
    <div className={`lexical-editor-wrapper ${className || ""}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container border border-zinc-200 rounded-lg bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <Toolbar />
          <div className="editor-inner relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="editor-input min-h-[300px] px-4 py-3 outline-none prose prose-zinc dark:prose-invert max-w-none" />
              }
              placeholder={
                <div className="editor-placeholder absolute top-3 left-4 text-zinc-400 pointer-events-none">
                  {placeholder || "Start typing..."}
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <OnChangePlugin onChange={onChange} />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <LinkPlugin />
            <ListPlugin />
            <EditorRefPlugin editorRef={editorRef} />
          </div>
        </div>
      </LexicalComposer>
    </div>
  )
}

// Helper function to get editor state as JSON
export async function getEditorStateAsJSON(editor: LexicalEditor): Promise<string> {
  return new Promise((resolve) => {
    editor.getEditorState().read(() => {
      const root = $getRoot()
      const json = JSON.stringify(root.exportJSON())
      resolve(json)
    })
  })
}

// Helper function to get editor state as HTML
export async function getEditorStateAsHTML(editor: LexicalEditor): Promise<string> {
  return new Promise((resolve) => {
    editor.getEditorState().read(() => {
      const html = $generateHtmlFromNodes(editor, null)
      resolve(html)
    })
  })
}
