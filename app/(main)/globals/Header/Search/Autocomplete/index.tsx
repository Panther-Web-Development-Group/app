"use client"

import {
  FC,
  PropsWithChildren,
  useEffect,
  useRef,
  Children,
  cloneElement,
  isValidElement,
} from "react"
import { cn } from "@/lib/cn"
import { AutocompleteProvider, useAutocomplete } from "./Context"
import { SearchAutocompleteSection } from "./Section"
import { SearchAutocompleteItem } from "./Item"
import { SearchInput } from "../Input"
import type { SearchAutocompleteProps } from "../types"

const AutocompleteRoot: FC<PropsWithChildren<SearchAutocompleteProps>> = ({
  className,
  children,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <AutocompleteProvider>
      <div
        ref={containerRef}
        className={cn("relative flex w-full items-center", className)}
        {...props}
      >
        <AutocompleteContent containerRef={containerRef}>
          {children}
        </AutocompleteContent>
      </div>
    </AutocompleteProvider>
  )
}

type AutocompleteContentProps = PropsWithChildren<{
  containerRef: React.RefObject<HTMLDivElement | null>
}>

const AutocompleteContent: FC<AutocompleteContentProps> = ({
  children,
  containerRef,
}) => {
  const {
    isOpen,
    setIsOpen,
    inputValue,
    setInputValue,
    highlightedIndex,
    setHighlightedIndex,
    setInputRef,
    setListRef,
    getItemCount,
    inputRef,
  } = useAutocomplete()

  const enhancedChildren = Children.map(children, (child) => {
    if (isValidElement(child) && child.type === SearchInput) {
      return cloneElement(child as React.ReactElement<{ ref?: React.Ref<HTMLInputElement> }>, {
        ref: (el: HTMLInputElement | null) => {
          setInputRef(el)
          const originalRef = (child as React.ReactElement<{ ref?: React.Ref<HTMLInputElement> }>).ref
          if (typeof originalRef === "function") originalRef(el)
          else if (originalRef) (originalRef as React.MutableRefObject<HTMLInputElement | null>).current = el
        },
        onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
          setIsOpen(true)
          ;(child as React.ReactElement<{ onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void }>).props.onFocus?.(e)
        },
        onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
          const relatedTarget = e.relatedTarget as Node | null
          if (!containerRef.current?.contains(relatedTarget)) {
            setIsOpen(false)
          }
          ;(child as React.ReactElement<{ onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void }>).props.onBlur?.(e)
        },
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          setInputValue(e.target.value)
          setIsOpen(true)
          setHighlightedIndex(-1)
          ;(child as React.ReactElement<{ onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }>).props.onChange?.(e)
        },
        onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
          const count = getItemCount()
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setHighlightedIndex((i) => (i < count - 1 ? i + 1 : 0))
          } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setHighlightedIndex((i) => (i > 0 ? i - 1 : count - 1))
          } else if (e.key === "Escape") {
            e.preventDefault()
            setIsOpen(false)
            inputRef.current?.blur()
          } else if (e.key === "Enter" && highlightedIndex >= 0 && count > 0) {
            e.preventDefault()
            const list = containerRef.current?.querySelector("[role='listbox']")
            const item = list?.querySelectorAll("[role='option']")[highlightedIndex]
            const link = item?.querySelector("a")
            if (link) link.click()
          }
          ;(child as React.ReactElement<{ onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void }>).props.onKeyDown?.(e)
        },
      })
    }
    return child
  })

  return <>{enhancedChildren}</>
}

const AutocompletePanel: FC<PropsWithChildren<{ className?: string }>> = ({
  className,
  children,
}) => {
  const { isOpen, setListRef, highlightedIndex, listRef, resetItemIndices } = useAutocomplete()
  resetItemIndices()

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !listRef.current) return
    const el = listRef.current.querySelectorAll("[role='option']")[highlightedIndex]
    el?.scrollIntoView({ block: "nearest" })
  }, [isOpen, highlightedIndex, listRef])

  if (!isOpen) return null

  return (
    <div
      className={cn(
        "absolute top-full left-0 right-0 z-[9999] mt-2 max-h-[min(400px,70vh)] overflow-y-auto",
        "rounded-xl border border-foreground/10 bg-header-background/95 backdrop-blur-xl shadow-xl text-foreground",
        "py-2 ring-1 ring-foreground/5",
        className
      )}
      role="listbox"
      ref={setListRef}
    >
      {children}
    </div>
  )
}

export const SearchAutocomplete = Object.assign(AutocompleteRoot, {
  Section: SearchAutocompleteSection,
  Item: SearchAutocompleteItem,
  Panel: AutocompletePanel,
})
