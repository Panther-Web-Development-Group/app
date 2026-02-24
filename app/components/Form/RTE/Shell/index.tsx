"use client"

import { LexicalComposer } from "@lexical/react/LexicalComposer"
import type { LexicalEditor } from "lexical"
import type { ReactNode } from "react"
import { cn } from "@/lib/cn"
import type { ClassValue } from "clsx"
import { BlockSelectionProvider } from "./Field/Blocks/BlockSelectionContext"
import { ActiveFormatsPlugin } from "./plugins/ActiveFormatsPlugin"
import { BlurOnEscapePlugin } from "./plugins/BlurOnEscapePlugin"
import { MaxLengthPlugin } from "./plugins/MaxLengthPlugin"
import { useRTE } from "../Context"
import { ShellToolbar } from "./Toolbar"
import { ShellField } from "./Field"

export interface ShellProps {
  inputId: string
  placeholder?: string
  contentClassName?: ClassValue
  contentMinHeightClassName?: string
  required?: boolean
  descriptionId: string
  description?: React.ReactNode
  descriptionClassName?: ClassValue
  descriptionType?: "text" | "tooltip"
  collapseOnBlur?: boolean
  editorClassName?: ClassValue
  editorContainerClassName?: ClassValue
  /** Toolbar content (e.g. ShellToolbarItem components). Each item registers itself with context. */
  children?: ReactNode
  autoFocus?: boolean
  /** Max character count (text content). When set, typing/paste/enter are blocked when at limit. */
  maxLength?: number
  onChange?: (editorState: import("lexical").EditorState, editor: LexicalEditor, html: string) => void
}

export function Shell({
  inputId,
  placeholder,
  contentClassName,
  contentMinHeightClassName,
  required,
  descriptionId,
  description,
  descriptionClassName,
  descriptionType = "text",
  collapseOnBlur = true,
  editorClassName,
  editorContainerClassName,
  children,
  autoFocus = false,
  maxLength,
  onChange,
}: ShellProps) {
  const { initialConfig, handleFocusCapture, handleBlurCapture, isFocused } = useRTE()
  const showInlineDescription =
    descriptionType !== "tooltip" && !!description && (!collapseOnBlur || isFocused)

  return (
    <div
      className={cn("lexical-editor-wrapper", editorClassName)}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <ActiveFormatsPlugin />
        <BlurOnEscapePlugin />
        {maxLength != null && maxLength > 0 ? (
          <MaxLengthPlugin maxLength={maxLength} />
        ) : null}
        <BlockSelectionProvider>
          <div
            className={cn(
              "editor-container flex min-w-0 w-full max-w-full flex-col rounded-sm overflow-x-hidden",
              "border border-foreground/10 dark:border-foreground/20",
              "bg-background shadow-sm",
              editorContainerClassName
            )}
          >
            <ShellToolbar>{children}</ShellToolbar>
            <ShellField
              inputId={inputId}
              placeholder={placeholder}
              contentClassName={contentClassName}
              contentMinHeightClassName={contentMinHeightClassName}
              required={required}
              ariaDescribedby={showInlineDescription ? descriptionId : undefined}
              onChange={onChange}
              autoFocus={autoFocus}
            />
          </div>
        </BlockSelectionProvider>
      </LexicalComposer>
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
