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
  filter,
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

  const orderRef = useRef(0)
  const [optionsMap, setOptionsMap] = useState<Map<string, OptionRecord>>(() => new Map())

  const registerOption = useCallback((optValue: string, data: { text: string; disabled?: boolean }) => {
    setOptionsMap((prev) => {
      const next = new Map(prev)
      const existing = next.get(optValue)
      const order = existing?.order ?? (orderRef.current += 1)
      next.set(optValue, { value: optValue, text: data.text, disabled: data.disabled, order })
      return next
    })
  }, [])

  const unregisterOption = useCallback((optValue: string) => {
    setOptionsMap((prev) => {
      if (!prev.has(optValue)) return prev
      const next = new Map(prev)
      next.delete(optValue)
      return next
    })
  }, [])

  const getOptionText = useCallback(
    (optValue: string) => {
      return optionsMap.get(optValue)?.text
    },
    [optionsMap]
  )

  const getOptionDisabled = useCallback(
    (optValue: string) => {
      return optionsMap.get(optValue)?.disabled ? true : false
    },
    [optionsMap]
  )

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

      const visible = getVisibleValues()
      const first = visible[0]
      if (!first) return
      if (!activeValue || !visible.includes(activeValue)) {
        setActiveValue(first)
      }
    },
    [activeValue, getVisibleValues]
  )

  // Close on outside click / Escape
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false)
        setQuery("")
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        setQuery("")
      }
    }

    const controller = new AbortController()
    const { signal } = controller
    document.addEventListener("mousedown", onPointerDown, { signal })
    document.addEventListener("touchstart", onPointerDown, { passive: true, signal })
    document.addEventListener("keydown", onKeyDown, { signal })
    return () => controller.abort()
  }, [open, setOpen, setQuery])

  const generatedId = useId()
  const inputId = `${generatedId}-input`
  const listboxId = `${generatedId}-listbox`

  const getOptionId = useCallback(
    (optValue: string) => `${listboxId}-opt-${toSafeIdPart(optValue)}`,
    [listboxId]
  )

  const ctx = useMemo<ComboboxContextValue>(
    () => ({
      name,
      disabled,
      open,
      setOpen,
      value,
      setValue,
      query,
      setQuery,
      placeholder,
      clearOnSelect,
      filter,
      activeValue,
      setActiveValue,
      registerOption,
      unregisterOption,
      getOptionText,
      getOptionDisabled,
      getVisibleValues,
      getOptionId,
      inputId,
      listboxId,
    }),
    [
      name,
      disabled,
      open,
      setOpen,
      value,
      setValue,
      query,
      setQuery,
      placeholder,
      clearOnSelect,
      filter,
      activeValue,
      registerOption,
      unregisterOption,
      getOptionText,
      getOptionDisabled,
      getVisibleValues,
      getOptionId,
      inputId,
      listboxId,
    ]
  )

  return (
    <div
      {...divProps}
      ref={rootRef}
      className={cn("relative", className)}
      data-disabled={disabled ? "" : undefined}
    >
      {!disabled && name && value ? <input type="hidden" name={name} value={value} /> : null}
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

