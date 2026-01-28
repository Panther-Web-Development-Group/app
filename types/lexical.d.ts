// Lexical typing augmentation.
// Some Lexical versions expose `parseEditorState` at runtime but the TS types may omit it.
// This keeps our usage type-safe across versions.

import type { EditorState } from "lexical"

declare module "lexical" {
  interface LexicalEditor {
    parseEditorState(serializedEditorState: string, updateFn?: () => void): EditorState
  }
}

export {}

