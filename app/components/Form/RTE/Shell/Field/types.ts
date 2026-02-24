import type { LexicalEditor, EditorState } from "lexical"
import type { ClassValue } from "clsx"

export interface ShellFieldProps {
  inputId: string
  placeholder?: string
  contentClassName?: ClassValue
  contentMinHeightClassName?: string
  required?: boolean
  ariaDescribedby?: string
  onChange?: (editorState: EditorState, editor: LexicalEditor, html: string) => void
  autoFocus?: boolean
}
