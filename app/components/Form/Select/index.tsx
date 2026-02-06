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
  type ReactNode,
} from "react"
import type { SelectContextValue, SelectProps } from "./types"
import { cn } from "@/lib/cn"
import { SelectProvider } from "./Context"
import { SelectTrigger } from "./Trigger"
import { SelectContent } from "./Content"
import { SelectOption } from "./Option"
import { SelectGroup } from "./Group"

const SelectRoot: FC<PropsWithChildren<SelectProps>> = ({
  className,
  name,
  disabled,
  multiple = false,
  showMultiple = "collapsed",
  placeholder,
  value: valueProp,
  defaultValue,
  onValueChange,
  children,
  ...divProps
}) => {
  const isControlled = valueProp !== undefined

  const [uncontrolledValue, setUncontrolledValue] = useState<string | string[] | undefined>(() => {
    if (defaultValue !== undefined) return defaultValue
    return multiple ? [] : undefined
  })

  const value = isControlled ? valueProp : uncontrolledValue

  const normalizedValue = useMemo<string | string[] | undefined>(() => {
    if (multiple) {
      if (Array.isArray(value)) return value
      if (typeof value === "string") return [value]
      return []
    }

    return typeof value === "string" ? value : undefined
  }, [multiple, value])

  const setValue = useCallback(
    (next: string | string[]) => {
      const normalizedNext: string | string[] = multiple
        ? (Array.isArray(next) ? next : [next])
        : (Array.isArray(next) ? (next[0] ?? "") : next)

      if (!isControlled) setUncontrolledValue(normalizedNext)
      onValueChange?.(normalizedNext)
    },
    [isControlled, multiple, onValueChange]
  )

  const [open, setOpenState] = useState(false)
  const [focusedValue, setFocusedValue] = useState<string | null>(null)
  const [labelsVersion, setLabelsVersion] = useState(0)

  const setOpen = useCallback(
    (newOpen: boolean) => {
      setOpenState(newOpen)
      if (!newOpen) {
        // Reset focused value when closing
        setFocusedValue(null)
      } else {
        // Set initial focused value when opening
        // Use setTimeout to avoid synchronous setState
        setTimeout(() => {
          if (multiple) {
            const arr = Array.isArray(normalizedValue) ? normalizedValue : []
            if (arr.length > 0) setFocusedValue(arr[0])
          } else {
            const v = typeof normalizedValue === "string" ? normalizedValue : null
            setFocusedValue(v)
          }
        }, 0)
      }
    },
    [multiple, normalizedValue]
  )

  const optionLabelsRef = useRef<Map<string, ReactNode>>(new Map())
  const optionElementsRef = useRef<Map<string, HTMLElement | null>>(new Map())
  const optionValuesRef = useRef<Set<string>>(new Set())

  const registerOption = useCallback((v: string, label: ReactNode, element: HTMLElement | null) => {
    optionLabelsRef.current.set(v, label)
    optionElementsRef.current.set(v, element)
    optionValuesRef.current.add(v)
    setLabelsVersion((prev) => prev + 1)
  }, [])

  const unregisterOption = useCallback((v: string) => {
    optionLabelsRef.current.delete(v)
    optionElementsRef.current.delete(v)
    optionValuesRef.current.delete(v)
    setLabelsVersion((prev) => prev + 1)
  }, [])

  const getAllOptionValues = useCallback(() => {
    return Array.from(optionValuesRef.current)
  }, [])

  const getOptionLabel = useCallback((v: string) => {
    return optionLabelsRef.current.get(v)
  }, [])

  const getOptionElement = useCallback((v: string) => {
    return optionElementsRef.current.get(v)
  }, [])

  const generatedId = useId()
  const triggerId = `${generatedId}-trigger`
  const listboxId = `${generatedId}-listbox`

  const rootRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false)
        setFocusedValue(null)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape": {
          setOpen(false)
          setFocusedValue(null)
          // Return focus to trigger
          const trigger = document.getElementById(triggerId)
          trigger?.focus()
          break
        }
      }
    }

    const controller = new AbortController()
    const { signal } = controller

    document.addEventListener("mousedown", onPointerDown, { signal })
    document.addEventListener("touchstart", onPointerDown, { passive: true, signal })
    document.addEventListener("keydown", onKeyDown, { signal })
    return () => controller.abort()
  }, [open, triggerId, setOpen, setFocusedValue])


  const ctx = useMemo<SelectContextValue>(
    () => ({
      name,
      disabled,
      multiple,
      showMultiple,
      placeholder,
      open,
      setOpen,
      value: normalizedValue,
      setValue,
      registerOption,
      unregisterOption,
      getOptionLabel,
      getOptionElement,
      focusedValue,
      setFocusedValue,
      triggerId,
      listboxId,
      getAllOptionValues,
      labelsVersion,
    }),
    [
      name,
      disabled,
      multiple,
      showMultiple,
      placeholder,
      open,
      normalizedValue,
      setValue,
      registerOption,
      unregisterOption,
      getOptionLabel,
      getOptionElement,
      getAllOptionValues,
      focusedValue,
      setFocusedValue,
      setOpen,
      triggerId,
      listboxId,
      labelsVersion,
    ]
  )

  return (
    <div
      {...divProps}
      ref={rootRef}
      className={cn("relative", className)}
      data-disabled={disabled ? "" : undefined}
      data-multiple={multiple ? "" : undefined}
    >
      {!disabled && name ? (
        multiple ? (
          (Array.isArray(normalizedValue) ? normalizedValue : []).map((v) => (
            <input key={v} type="hidden" name={name} value={v} />
          ))
        ) : (
          typeof normalizedValue === "string" && normalizedValue ? (
            <input type="hidden" name={name} value={normalizedValue} />
          ) : null
        )
      ) : null}

      <SelectProvider value={ctx}>{children}</SelectProvider>
    </div>
  )
}

export const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Content: SelectContent,
  Option: SelectOption,
  Group: SelectGroup,
})

// Named exports for Server Components (avoid `Select.Trigger` across RSC boundary)
export { SelectTrigger } from "./Trigger"
export { SelectContent } from "./Content"
export { SelectOption } from "./Option"
export { SelectGroup } from "./Group"

export type {
  SelectProps,
} from "./types"
