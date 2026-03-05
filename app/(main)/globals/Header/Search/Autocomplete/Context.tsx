"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
  type FC,
  type PropsWithChildren,
} from "react"

export type AutocompleteContextType = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  inputValue: string
  setInputValue: (value: string) => void
  highlightedIndex: number
  setHighlightedIndex: (index: number) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  setInputRef: (el: HTMLInputElement | null) => void
  listRef: React.RefObject<HTMLDivElement | null>
  setListRef: (el: HTMLDivElement | null) => void
  getItemCount: () => number
  getNextItemIndex: () => number
  resetItemIndices: () => void
}

const AutocompleteContext = createContext<AutocompleteContextType | undefined>(undefined)

export const useAutocomplete = () => {
  const context = useContext(AutocompleteContext)
  if (!context) throw new Error("useAutocomplete must be used within Search.Autocomplete")
  return context
}

type AutocompleteProviderProps = PropsWithChildren & {
  onOpenChange?: (open: boolean) => void
}

export const AutocompleteProvider: FC<AutocompleteProviderProps> = ({
  children,
  onOpenChange,
}) => {
  const [isOpen, setIsOpenState] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const itemIndexCounter = useRef(0)

  const setIsOpen = useCallback(
    (open: boolean) => {
      setIsOpenState(open)
      itemIndexCounter.current = 0
      if (!open) setHighlightedIndex(-1)
      onOpenChange?.(open)
    },
    [onOpenChange]
  )

  const getNextItemIndex = useCallback(() => {
    const index = itemIndexCounter.current
    itemIndexCounter.current += 1
    return index
  }, [])

  const setInputRef = useCallback((el: HTMLInputElement | null) => {
    inputRef.current = el
  }, [])

  const setListRef = useCallback((el: HTMLDivElement | null) => {
    listRef.current = el
  }, [])

  const getItemCount = useCallback(() => {
    if (!listRef.current) return 0
    return listRef.current.querySelectorAll("[role='option']").length
  }, [])

  const resetItemIndices = useCallback(() => {
    itemIndexCounter.current = 0
  }, [])

  const contextValue = useMemo<AutocompleteContextType>(
    () => ({
      isOpen,
      setIsOpen,
      inputValue,
      setInputValue,
      highlightedIndex,
      setHighlightedIndex,
      inputRef,
      setInputRef,
      listRef,
      setListRef,
      getItemCount,
      getNextItemIndex,
      resetItemIndices,
    }),
    [isOpen, setIsOpen, inputValue, highlightedIndex, getItemCount, getNextItemIndex, resetItemIndices]
  )

  return (
    <AutocompleteContext.Provider value={contextValue}>
      {children}
    </AutocompleteContext.Provider>
  )
}
