"use client"

import { useRef } from "react"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { TablePlugin } from "@lexical/react/LexicalTablePlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin"
import type { LexicalEditor } from "lexical"
import { cn } from "@/lib/cn"
import { OnChangePlugin } from "@/app/components/Form/Editor/OnChangePlugin"
import { DecoratorNodePlugin } from "@/app/components/Form/Editor/plugins/DecoratorNodePlugin"
import { MarkdownShortcutsPlugin } from "@/app/components/Form/Editor/plugins/MarkdownShortcutsPlugin"
import { CodeHighlightPlugin } from "@/app/components/Form/Editor/plugins/CodeHighlightPlugin"
import { ShellBlockFloatingMenu, TableHandle } from "./Blocks"
import type { ShellFieldProps } from "./types"

export function ShellField({
  inputId,
  placeholder = "Start typing...",
  contentClassName,
  contentMinHeightClassName = "min-h-[300px]",
  required,
  ariaDescribedby,
  onChange,
  autoFocus = false,
}: ShellFieldProps) {
  const editorRef = useRef<LexicalEditor | null>(null)

  return (
    <div className="editor-inner relative">
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            id={inputId}
            aria-required={required ? true : undefined}
            aria-describedby={ariaDescribedby}
            className={cn(
              "editor-input px-4 py-3 outline-none",
              "prose prose-zinc dark:prose-invert max-w-none",
              "prose-headings:font-semibold prose-headings:text-foreground",
              "prose-p:text-foreground/90 prose-p:leading-relaxed",
              "prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline",
              "prose-code:text-foreground prose-code:bg-foreground/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
              "prose-pre:bg-foreground/5 prose-pre:border prose-pre:border-foreground/10",
              "prose-ul:list-disc prose-ol:list-decimal",
              "prose-blockquote:border-l-4 prose-blockquote:border-foreground/20 prose-blockquote:pl-4 prose-blockquote:italic",
              "focus-visible:outline-none",
              contentMinHeightClassName,
              contentClassName
            )}
          />
        }
        placeholder={
          <div className="editor-placeholder absolute top-3 left-4 pointer-events-none text-foreground/40 select-none">
            {placeholder}
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <OnChangePlugin onChange={onChange} />
      <HistoryPlugin />
      {autoFocus ? <AutoFocusPlugin /> : null}
      <LinkPlugin />
      <ListPlugin />
      <TablePlugin />
      <EditorRefPlugin editorRef={editorRef} />
      <DecoratorNodePlugin />
      <MarkdownShortcutsPlugin />
      <CodeHighlightPlugin />
      <ShellBlockFloatingMenu />
      <TableHandle />
    </div>
  )
}
