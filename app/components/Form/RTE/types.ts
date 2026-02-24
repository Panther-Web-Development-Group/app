import React, {
  Dispatch,
  SetStateAction,
  ReactNode,
  RefObject,
  PropsWithChildren,
  HTMLAttributes,
  DetailedHTMLProps
} from "react"
import { 
  EditorState,
  LexicalEditor 
} from "lexical"
import { ClassValue } from "clsx"
import { InitialConfigType } from "@lexical/react/LexicalComposer"
import type { FormatAction } from "./formatReducer"

export type ValidToolbarButtonTypes =
  | "command"
  | "menu"
  | "dropdown"

export type ToolbarCommandOptions = {
  type: "command"
  dispatcher: ((editor: LexicalEditor) => void) 
    | (() => void)
}

export type ToolbarMenuOptions = {
  type: "menu"
  items: ReactNode[]
}

export type ToolbarDropdownOptions = {
  type: "dropdown"
  children: ReactNode
}

export type ToolbarItemOptions = 
  | ToolbarCommandOptions
  | ToolbarMenuOptions
  | ToolbarDropdownOptions

export type ToolbarItemName = string

export type UnregisterToolbarItemFunction =
  (id?: string) => void

export type UnregisterToolbarItemsFunction =
  (ids?: string[]) => void

export type RegisterToolbarItemsFunction =
  (items: ToolbarItem[]) => UnregisterToolbarItemsFunction

export type ToolbarItem = {
  id: string
  group?: string
  description?: ReactNode
  icon?: ReactNode
} & ToolbarItemOptions

export type RegisterToolbarItemFunction =
  (id: string, options: ToolbarItemOptions) => UnregisterToolbarItemFunction

export interface BaseRTEProps {
  initialContent?: string | null
  onChange?: (editorState: EditorState, editor: LexicalEditor, html: string) => void
  placeholder?: string

  resetKey?: string | number
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void
  onFocusIn?: (e: React.FocusEvent<HTMLDivElement>) => void
  onFocusOut?: (e: React.FocusEvent<HTMLDivElement>) => void

  label?: ReactNode
  labelClassName?: string
  labelIcon?: ReactNode
  labelIconClassName?: string
  labelName?: string

  showRequired?: boolean
  required?: boolean

  description?: ReactNode
  descriptionClassName?: ClassValue
  descriptionType?: "text" | "tooltip"
  collapseOnBlur?: boolean

  editorClassName?: ClassValue
  editorContainerClassName?: ClassValue
  contentClassName?: ClassValue
  /** Min-height class for the editable area (default: min-h-[300px]) */
  contentMinHeightClassName?: string

  autoFocus?: boolean
  /** Max character count (text content). When set, typing/paste/enter are blocked when at limit. */
  maxLength?: number
  enabledToolbarItems?: ToolbarItemName[]
}

export type RTEProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & BaseRTEProps

export interface RTEContextProps {
  isFocused: boolean
  setIsFocused: Dispatch<SetStateAction<boolean>>
  isFocusedRef: RefObject<boolean>

  latestInitialContentRef: RefObject<string | null | undefined>
  
  initialContentSnapshot: string | null | undefined
  setInitialContentSnapshot: Dispatch<SetStateAction<string | null | undefined>>

  importContent: (editor: LexicalEditor, content: string) => void

  handleFocusCapture: (e: React.FocusEvent<HTMLDivElement>) => void
  handleBlurCapture: (e: React.FocusEvent<HTMLDivElement>) => void

  resetKey: string | number
  namespace: string

  initialEditorState: (initialContent?: string) => string | undefined
  initialConfig: InitialConfigType

  registerToolbarItem: RegisterToolbarItemFunction
  unregisterToolbarItem: UnregisterToolbarItemFunction
  registerToolbarItems: RegisterToolbarItemsFunction
  unregisterToolbarItems: UnregisterToolbarItemsFunction
  unregisterAllToolbarItems: () => void
  toolbarItems: ToolbarItem[]
  enabledToolbarItems: ToolbarItemName[]

  activeFormats: string[]
  dispatchFormatAction: Dispatch<FormatAction>
}

export interface RTEProviderProps extends PropsWithChildren {
  resetKey: string | number
  namespace: string
  initialConfig: InitialConfigType
  initialEditorState: (initialContent?: string) => string | undefined
  initialContent?: string | null
  importContent?: (editor: LexicalEditor, content: string) => void
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void
  enabledToolbarItems?: ToolbarItemName[]
}