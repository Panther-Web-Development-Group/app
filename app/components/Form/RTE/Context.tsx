"use client"

import {
  createContext,
  useContext,
  useCallback,
  useReducer,
  useRef,
  useState,
  useMemo,
  useLayoutEffect,
  type FC,
} from "react"
import type { LexicalEditor } from "lexical"
import {
  type RTEContextProps,
  type RTEProviderProps,
  type ToolbarItem,
  type ToolbarItemOptions,
  ToolbarItemName,
} from "./types"
import { importContent as importContentAction } from "./actions/editorState"
import { formatReducer } from "./formatReducer"

export const RTEContext = createContext<RTEContextProps | null>(null)

export const useRTE = () => {
  const context = useContext(RTEContext)
  if (!context) throw new Error("useRTEContext must be used within an RTEProvider")
  return context
}

export const useRTEContext = useRTE

export const RTEProvider: FC<RTEProviderProps> = ({
  resetKey,
  namespace,
  initialConfig,
  initialEditorState,
  initialContent,
  importContent: importContentProp,
  onFocus,
  onBlur,
  enabledToolbarItems: enabledToolbarItemsProp,
  children,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const isFocusedRef = useRef(isFocused)
  const latestInitialContentRef = useRef<string | null | undefined>(initialContent ?? null)
  const [initialContentSnapshot, setInitialContentSnapshot] = useState<string | null | undefined>(
    initialContent ?? null
  )
  const [toolbarItems, setToolbarItems] = useState<ToolbarItem[]>([])
  const [enabledToolbarItems, setEnabledToolbarItems] = useState<ToolbarItemName[]>(
    enabledToolbarItemsProp ?? []
  )
  const [activeFormats, dispatchFormatAction] = useReducer(formatReducer, [])

  useLayoutEffect(() => {
    isFocusedRef.current = isFocused
  }, [isFocused])

  useLayoutEffect(() => {
    latestInitialContentRef.current = initialContent ?? null
  }, [initialContent])

  // Sync enabledToolbarItems when prop changes (compare by value to avoid loop when parent passes new array ref each render)
  const prevToolbarItemsRef = useRef<ToolbarItemName[]>(enabledToolbarItemsProp ?? [])
  useLayoutEffect(() => {
    const next = enabledToolbarItemsProp ?? []
    const prev = prevToolbarItemsRef.current
    const same =
      prev.length === next.length &&
      next.every((name, i) => prev[i] === name)
    if (!same) {
      prevToolbarItemsRef.current = next
      setTimeout(() => setEnabledToolbarItems(next), 0)
    }
  }, [enabledToolbarItemsProp])

  const importContent = useCallback(
    (editor: LexicalEditor, content: string) => {
      const fn = importContentProp ?? ((ed, html) => { importContentAction(ed, html) })
      fn(editor, content)
    },
    [importContentProp]
  )

  const handleFocusCapture = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      isFocusedRef.current = true
      setIsFocused(true)
      onFocus?.(e)
    },
    [onFocus]
  )

  const handleBlurCapture = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      isFocusedRef.current = false
      setIsFocused(false)
      onBlur?.(e)
    },
    [onBlur]
  )

  const unregisterToolbarItem = useCallback((id?: string) => {
    if (id === undefined) return
    setToolbarItems((prev) => {
      const next = prev.filter((item) => item.id !== id)
      return next.length < prev.length ? next : prev
    })
  }, [])

  const registerToolbarItem = useCallback(
    (id: string, options: ToolbarItemOptions) => {
      const item: ToolbarItem = { id, ...options }
      setToolbarItems((prev) => {
        const next = prev.some((i) => i.id === id)
          ? prev.map((i) => (i.id === id ? item : i))
          : [...prev, item]
        return next
      })
      return (idArg?: string) => unregisterToolbarItem(idArg ?? id)
    },
    [unregisterToolbarItem]
  )

  const unregisterToolbarItems = useCallback(
    (ids?: string[]) => {
      if (ids === undefined || ids.length === 0) return
      const idSet = new Set(ids)
      setToolbarItems((prev) => {
        const next = prev.filter((item) => !idSet.has(item.id))
        return next.length < prev.length ? next : prev
      })
    },
    []
  )

  const registerToolbarItems = useCallback(
    (items: ToolbarItem[]) => {
      setToolbarItems((prev) => [...prev, ...items])
      return (ids?: string[]) => unregisterToolbarItems(ids)
    },
    [unregisterToolbarItems]
  )

  const unregisterAllToolbarItems = useCallback(() => {
    setToolbarItems([])
  }, [])

  const memoizedValue: RTEContextProps = useMemo(() => ({
    isFocused,
    setIsFocused,
    isFocusedRef,
    latestInitialContentRef,
    initialContentSnapshot,
    setInitialContentSnapshot,
    importContent,
    handleFocusCapture,
    handleBlurCapture,
    resetKey,
    namespace,
    initialEditorState,
    initialConfig,
    registerToolbarItem,
    unregisterToolbarItem,
    registerToolbarItems,
    unregisterToolbarItems,
    unregisterAllToolbarItems,
    toolbarItems,
    enabledToolbarItems,
    activeFormats,
    dispatchFormatAction
  }), [isFocused, setIsFocused, isFocusedRef, latestInitialContentRef, initialContentSnapshot, setInitialContentSnapshot, importContent, handleFocusCapture, handleBlurCapture, resetKey, namespace, initialEditorState, initialConfig, registerToolbarItem, unregisterToolbarItem, registerToolbarItems, unregisterToolbarItems, unregisterAllToolbarItems, toolbarItems, enabledToolbarItems, activeFormats, dispatchFormatAction])

  return <RTEContext.Provider value={memoizedValue}>{children}</RTEContext.Provider>
}
