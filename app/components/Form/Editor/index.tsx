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
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection"
import { mergeRegister } from "@lexical/utils"
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from "lexical"
import { ImageNode, CardNode, VideoNode } from "./nodes"
import { DecoratorNodePlugin } from "./plugins/DecoratorNodePlugin"
import { MarkdownShortcutsPlugin } from "./plugins/MarkdownShortcutsPlugin"
import { CodeHighlightPlugin } from "./plugins/CodeHighlightPlugin"
import { BlockFloatingMenu } from "./components/BlockFloatingMenu"
import { BlockSelectionProvider } from "./components/BlockSelectionContext"
import { $getRoot, $insertNodes, EditorState, LexicalEditor } from "lexical"
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react"
import { Toolbar } from "./Toolbar"
import { editorConfig } from "./config"
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html"
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown"
import { OnChangePlugin } from "./OnChangePlugin"
import { cn } from "@/lib/cn"
import { Label } from "../Label"
import { Tooltip } from "@/app/components/Tooltip"
import { Button } from "@/app/components/Button"
import { InfoIcon } from "lucide-react"
import { InitialConfigType } from "@lexical/react/LexicalComposer"

interface EditorProps {
  initialContent?: string | null
  onChange?: (editorState: EditorState, editor: LexicalEditor, html: string) => void
  placeholder?: string

  /** Group wrapper className (like `InputGroup`) */
  className?: string
  id?: string
  /** Force re-init when this changes (like changing controlled field). */
  resetKey?: string | number
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void

  // Label props
  label?: ReactNode
  labelClassName?: string
  labelIcon?: ReactNode
  labelIconClassName?: string
  labelName?: string
  /** Visual required indicator when `required` is true (default: true). */
  showRequired?: boolean
  /** Marks the field as required (used for asterisk + aria). */
  required?: boolean

  // Description props
  description?: ReactNode
  descriptionClassName?: string
  descriptionType?: "text" | "tooltip"
  collapseOnBlur?: boolean // default: true

  /** Lexical wrapper className (legacy) */
  editorClassName?: string
  /** Container around toolbar + editor */
  editorContainerClassName?: string
  /** ContentEditable className */
  contentClassName?: string
  /** Min-height class for the editable area (default: min-h-[300px]) */
  contentMinHeightClassName?: string

  /** Opt-in focus on mount (default: false) */
  autoFocus?: boolean
}

export function Editor({
  initialContent,
  onChange,
  placeholder,

  className,
  id: idProp,
  resetKey,
  onFocus,
  onBlur,

  label,
  labelClassName,
  labelIcon,
  labelIconClassName,
  labelName,
  showRequired = true,
  required,

  description,
  descriptionClassName,
  descriptionType = "text",
  collapseOnBlur = true,

  editorClassName,
  editorContainerClassName,
  contentClassName,
  contentMinHeightClassName = "min-h-[300px]",

  autoFocus = false,
}: EditorProps) {
  const editorRef = useRef<LexicalEditor | null>(null)
  const generatedId = useId()
  const inputId = idProp ?? generatedId
  const descriptionId = `${inputId}-description`

  const [isFocused, setIsFocused] = useState(false)
  const isFocusedRef = useRef(false)

  // Treat `initialContent` as truly-initial (like `defaultValue`), unless `resetKey` changes.
  const latestInitialContentRef = useRef<string | null | undefined>(initialContent)
  const [initialContentSnapshot, setInitialContentSnapshot] = useState<string | null | undefined>(
    initialContent,
  )

  useEffect(() => {
    latestInitialContentRef.current = initialContent
  }, [initialContent])

  useEffect(() => {
    if (resetKey === undefined) return
    setInitialContentSnapshot(latestInitialContentRef.current)
  }, [resetKey])

  const importContent = useCallback((editor: LexicalEditor, content: string) => {
    // 1) Try Lexical JSON first
    try {
      const parsedState = editor.parseEditorState(content)
      editor.setEditorState(parsedState)
      return
    } catch {
      // fall through
    }

    // 2) Try Markdown next
    try {
      const markdown = $convertToMarkdownString(TRANSFORMERS)
      const parsedState = editor.parseEditorState(markdown)
      editor.setEditorState(parsedState)
      return
    } catch {
      // fall through
    }

    // 3) Otherwise treat it as HTML
    try {
      const dom = new DOMParser().parseFromString(content, "text/html")
      editor.update(() => {
        const root = $getRoot()
        root.clear()
        root.select()
        const nodes = $generateNodesFromDOM(editor, dom)
        $insertNodes(nodes)
      })
    } catch {
      // If import fails, keep editor as-is
    }
  }, [])

  useEffect(() => {
    if (resetKey === undefined) return
    const editor = editorRef.current
    const content = latestInitialContentRef.current
    if (!editor || !content) return
    importContent(editor, content)
  }, [importContent, resetKey])

  const tooltipText = useMemo(() => {
    if (descriptionType !== "tooltip") return undefined
    return description
  }, [description, descriptionType])

  const showInlineDescription = useMemo(() => {
    return descriptionType !== "tooltip" && !!description && (!collapseOnBlur || isFocused)
  }, [description, descriptionType, collapseOnBlur, isFocused])

  const handleFocusCapture = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (!isFocusedRef.current) {
        isFocusedRef.current = true
        setIsFocused(true)
        onFocus?.(e)
      }
    },
    [onFocus],
  )

  const handleBlurCapture = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      const next = e.relatedTarget as Node | null
      if (next && e.currentTarget.contains(next)) return
      isFocusedRef.current = false
      setIsFocused(false)
      onBlur?.(e)
    },
    [onBlur],
  )

  const namespace = useMemo(() => {
    const safeId = inputId.replaceAll(":", "").replaceAll(" ", "")
    return `lexical-editor-${safeId}`
  }, [inputId])

  const initialEditorState = useMemo(() => {
    const content = initialContentSnapshot
    if (!content) return undefined

    return (editor: LexicalEditor) => {
      importContent(editor, content)
    }
  }, [importContent, initialContentSnapshot])

  const initialConfig = useMemo(() => {
    return {
      ...editorConfig,
      editorState: initialEditorState,
      namespace,
    } as InitialConfigType
  }, [initialEditorState, namespace])

  return (
    <div className={cn("space-y-1.5", className)}>
      {label || labelIcon || labelName ? (
        <Label
          htmlFor={inputId}
          name={labelName}
          icon={labelIcon}
          iconClassName={cn("text-foreground/70", labelIconClassName)}
          className={cn("block text-sm font-semibold text-foreground/80", labelClassName)}
        >
          {label ? (
            <span className="inline-flex items-center gap-1">
              <span>{label}</span>
              {showRequired && required ? (
                <span aria-hidden className="text-red-500">
                  *
                </span>
              ) : null}
            </span>
          ) : null}
          {tooltipText ? (
            <Tooltip content={tooltipText}>
              <Button
                type="button"
                variant="ghost"
                className="ml-1 h-5! w-5! p-0! rounded border border-(--pw-border) bg-background/10 text-foreground/70 hover:bg-background/20"
                aria-label="More info"
              >
                <InfoIcon className="h-4 w-4" />
              </Button>
            </Tooltip>
          ) : null}
        </Label>
      ) : null}

      <div
        className={cn("lexical-editor-wrapper", editorClassName)}
        onFocusCapture={handleFocusCapture}
        onBlurCapture={handleBlurCapture}
      >
        <LexicalComposer initialConfig={initialConfig}>
          <BlockSelectionProvider>
            <div
              className={cn(
                "editor-container w-full max-w-full rounded-sm",
                "border border-foreground/10 dark:border-foreground/20",
                "bg-background shadow-sm",
                "overflow-hidden",
                editorContainerClassName,
              )}
            >
              <Toolbar />
              <div className="editor-inner relative">
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable
                      id={inputId}
                      aria-required={required ? true : undefined}
                      aria-describedby={showInlineDescription ? descriptionId : undefined}
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
                        contentClassName,
                      )}
                    />
                  }
                  placeholder={
                    <div className="editor-placeholder absolute top-3 left-4 pointer-events-none text-foreground/40 select-none">
                      {placeholder || "Start typing..."}
                    </div>
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />
                <OnChangePlugin onChange={onChange} />
                <HistoryPlugin />
                {autoFocus ? <AutoFocusPlugin /> : null}
                <LinkPlugin />
                <ListPlugin />
                <EditorRefPlugin editorRef={editorRef} />
                <DecoratorNodePlugin />
                <MarkdownShortcutsPlugin />
                <CodeHighlightPlugin />
                <BlockFloatingMenu />
              </div>
            </div>
          </BlockSelectionProvider>
        </LexicalComposer>
      </div>

      {showInlineDescription ? (
        <div
          id={descriptionId}
          className={cn("text-xs leading-5 text-foreground/70", descriptionClassName)}
        >
          {description}
        </div>
      ) : null}
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

// Helper function to get editor state as Markdown
export async function getEditorStateAsMarkdown(editor: LexicalEditor): Promise<string> {
  return new Promise((resolve) => {
    editor.getEditorState().read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS)
      resolve(markdown)
    })
  })
}