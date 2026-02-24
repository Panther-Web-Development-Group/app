"use client"
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FC,
  type PropsWithChildren,
} from "react"
import type { ComboboxContextValue, ComboboxProps } from "./types"
import { cn } from "@/lib/cn"
import { ComboboxProvider } from "./Context"
import { ComboboxInput } from "./Input"
import { ComboboxContent } from "./Content"
import { ComboboxOption } from "./Option"

type OptionRecord = {
  value: string
  text: string
  disabled?: boolean
  order: number
}

function toSafeIdPart(value: string) {
  return value.replaceAll(/[^a-zA-Z0-9\-_]/g, "_")
}

const defaultFilter = ({ query, optionText }: { query: string; optionValue: string; optionText: string }) =>
  optionText.toLowerCase().includes(query.toLowerCase())

const ComboboxRoot: FC<PropsWithChildren<ComboboxProps>> = ({
  className,
  name,
  disabled,
  value: valueProp,
  defaultValue,
  onValueChange,
  query: queryProp,
  defaultQuery,
  onQueryChange,
  placeholder,
  clearOnSelect = true,
  focusInputAfterSelect = true,
  filter,
  onEscape,
  options: optionsProp,
  children,
  ...divProps
}) => {
  const valueControlled = valueProp !== undefined
  const queryControlled = queryProp !== undefined

  const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(defaultValue)
  const [uncontrolledQuery, setUncontrolledQuery] = useState<string>(defaultQuery ?? "")

  const value = valueControlled ? valueProp : uncontrolledValue
  const query = queryControlled ? queryProp : uncontrolledQuery

  const setValue = useCallback(
    (next: string) => {
      if (!valueControlled) setUncontrolledValue(next)
      onValueChange?.(next)
    },
    [onValueChange, valueControlled]
  )

  const setQuery = useCallback(
    (q: string) => {
      if (!queryControlled) setUncontrolledQuery(q)
      onQueryChange?.(q)
    },
    [onQueryChange, queryControlled]
  )

  const [open, setOpenState] = useState(false)
  const [activeValue, setActiveValue] = useState<string | undefined>(undefined)
  const isClickingOptionRef = useRef(false)
  const justSelectedRef = useRef(false)

  const orderRef = useRef(0)
  const [optionsMap, setOptionsMap] = useState<Map<string, OptionRecord>>(() => new Map())
  const optionElementsRef = useRef<Map<string, HTMLElement | null>>(new Map())

  const registerOption = useCallback(
    (optValue: string, data: { text: string; disabled?: boolean }, element: HTMLElement | null) => {
      setOptionsMap((prev) => {
        const next = new Map(prev)
        const existing = next.get(optValue)
        const order = existing?.order ?? (orderRef.current += 1)
        next.set(optValue, { value: optValue, text: data.text, disabled: data.disabled, order })
        return next
      })
      optionElementsRef.current.set(optValue, element)
    },
    []
  )

  const unregisterOption = useCallback((optValue: string) => {
    setOptionsMap((prev) => {
      if (!prev.has(optValue)) return prev
      const next = new Map(prev)
      next.delete(optValue)
      return next
    })
    optionElementsRef.current.delete(optValue)
  }, [])

  const getOptionText = useCallback(
    (optValue: string) => {
      const fromMap = optionsMap.get(optValue)?.text
      if (fromMap !== undefined) return fromMap
      return optionsProp?.find((o) => o.value === optValue)?.text
    },
    [optionsMap, optionsProp]
  )

  const getOptionDisabled = useCallback(
    (optValue: string) => {
      return optionsMap.get(optValue)?.disabled ? true : false
    },
    [optionsMap]
  )

  const getOptionElement = useCallback((optValue: string) => {
    return optionElementsRef.current.get(optValue)
  }, [])

  const visibleValues = useMemo(() => {
    const q = query.trim()
    const predicate = filter ?? defaultFilter
    const all = Array.from(optionsMap.values()).sort((a, b) => a.order - b.order)

    return all
      .filter((o) => {
        if (q.length === 0) return true
        return predicate({ query: q, optionValue: o.value, optionText: o.text })
      })
      .map((o) => o.value)
  }, [filter, optionsMap, query])

  const getVisibleValues = useCallback(() => {
    return visibleValues.filter((v) => !getOptionDisabled(v))
  }, [getOptionDisabled, visibleValues])

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next)
      if (!next) {
        setActiveValue(undefined)
        return
      }

      // Use setTimeout to avoid synchronous setState
      setTimeout(() => {
        const visible = getVisibleValues()
        const first = visible[0]
        if (!first) return
        if (!activeValue || !visible.includes(activeValue)) {
          setActiveValue(first)
        }
      }, 0)
    },
    [activeValue, getVisibleValues]
  )

  // When controlled value changes from outside (e.g. editor selection), clear query
  // so the input shows the new value's label instead of stale typed text.
  const valueRef = useRef(value)
  useEffect(() => {
    if (valueControlled && value !== valueRef.current) {
      valueRef.current = value
      if (!open) setQuery("")
    }
  }, [valueControlled, value, open, setQuery])

  // Clear "clicking option" ref on mouseup so we don't get stuck if user mousedowns then releases outside
  useEffect(() => {
    const onMouseUp = () => {
      if (isClickingOptionRef.current) {
        isClickingOptionRef.current = false
      }
    }
    document.addEventListener("mouseup", onMouseUp)
    return () => document.removeEventListener("mouseup", onMouseUp)
  }, [isClickingOptionRef])

  const rootRef = useRef<HTMLDivElement>(null)
  const generatedId = useId()
  const inputId = `${generatedId}-input`
  const listboxId = `${generatedId}-listbox`

  // Close on outside click / Escape (content may be in portal, so check both root and listbox)
  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target instanceof Node ? e.target : null
      if (!target) return
      if (rootRef.current?.contains(target)) return
      const listbox = document.getElementById(listboxId)
      if (listbox?.contains(target)) return
      setOpen(false)
      setQuery("")
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        setQuery("")
        onEscape?.()
      }
    }

    const controller = new AbortController()
    const { signal } = controller
    document.addEventListener("mousedown", onPointerDown, { signal })
    document.addEventListener("touchstart", onPointerDown, { passive: true, signal })
    document.addEventListener("keydown", onKeyDown, { signal })
    return () => controller.abort()
  }, [open, listboxId, setOpen, setQuery, onEscape])

  const getOptionId = useCallback(
    (optValue: string) => `${listboxId}-opt-${toSafeIdPart(optValue)}`,
    [listboxId]
  )

  const ctx = useMemo<ComboboxContextValue>(
    () => ({
      name,
      disabled,
      isClickingOptionRef,
      justSelectedRef,
      open,
      setOpen,
      value,
      setValue,
      query,
      setQuery,
      placeholder,
      clearOnSelect,
      focusInputAfterSelect,
      filter,
      activeValue,
      setActiveValue,
      registerOption,
      unregisterOption,
      getOptionText,
      getOptionDisabled,
      getOptionElement,
      getVisibleValues,
      getOptionId,
      inputId,
      listboxId,
    }),
    [
      name,
      disabled,
      isClickingOptionRef,
      justSelectedRef,
      open,
      setOpen,
      value,
      setValue,
      query,
      setQuery,
      placeholder,
      clearOnSelect,
      focusInputAfterSelect,
      filter,
      activeValue,
      registerOption,
      unregisterOption,
      getOptionText,
      getOptionDisabled,
      getOptionElement,
      getVisibleValues,
      getOptionId,
      inputId,
      listboxId,
    ]
  )

  // Ensure we always have a value for form submission (use defaultValue if value is undefined)
  const formValue = value ?? defaultValue ?? ""

  return (
    <div
      {...divProps}
      ref={rootRef}
      className={cn("relative", className)}
      data-disabled={disabled ? "" : undefined}
    >
      {!disabled && name && formValue ? <input type="hidden" name={name} value={formValue} /> : null}
      <ComboboxProvider value={ctx}>{children}</ComboboxProvider>
    </div>
  )
}

export const Combobox = Object.assign(ComboboxRoot, {
  Input: ComboboxInput,
  Content: ComboboxContent,
  Option: ComboboxOption,
})

export type { ComboboxProps } from "./types"

