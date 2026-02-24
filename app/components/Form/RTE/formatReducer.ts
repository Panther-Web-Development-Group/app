import type { Reducer } from "react"

export type FormatAction =
  | { type: "ACTIVATE_COMMAND"; command: string }
  | { type: "DEACTIVATE_COMMAND"; command: string }
  | { type: "TOGGLE_COMMAND"; command: string }
  | { type: "SET_COMMANDS"; commands: string[] }
  | { type: "CLEAR_COMMANDS" }

export const formatReducer: Reducer<string[], FormatAction> = (state, action) => {
  switch (action.type) {
    case "ACTIVATE_COMMAND":
      return state.includes(action.command) ? state : [...state, action.command]
    case "DEACTIVATE_COMMAND":
      return state.filter((command) => command !== action.command)
    case "TOGGLE_COMMAND":
      return state.includes(action.command)
        ? state.filter((command) => command !== action.command)
        : [...state, action.command]
    case "SET_COMMANDS":
      return action.commands
    case "CLEAR_COMMANDS":
      return []
    default:
      return state
  }
}

/** Lexical text format types we sync from selection into activeFormats */
export const TEXT_FORMAT_TYPES = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "code",
] as const

export type TextFormatType = (typeof TEXT_FORMAT_TYPES)[number]
