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

  const [open, setOpen] = useState(false)

  const optionLabelsRef = useRef<Map<string, ReactNode>>(new Map())
  const registerOption = useCallback((v: string, label: ReactNode) => {
    optionLabelsRef.current.set(v, label)
  }, [])
  const unregisterOption = useCallback((v: string) => {
    optionLabelsRef.current.delete(v)
  }, [])
  const getOptionLabel = useCallback((v: string) => {
    return optionLabelsRef.current.get(v)
  }, [])

  const generatedId = useId()
  const triggerId = `${generatedId}-trigger`
  const listboxId = `${generatedId}-listbox`

  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    const controller = new AbortController()
    const { signal } = controller

    document.addEventListener("mousedown", onPointerDown, { signal })
    document.addEventListener("touchstart", onPointerDown, { passive: true, signal })
    document.addEventListener("keydown", onKeyDown, { signal })
    return () => controller.abort()
  }, [open])

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
      triggerId,
      listboxId,
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
      triggerId,
      listboxId,
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

