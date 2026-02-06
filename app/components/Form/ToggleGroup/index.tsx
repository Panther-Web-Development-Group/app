"use client"

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type FC,
  type PropsWithChildren,
} from "react"
import type { ToggleGroupOption, ToggleGroupProps } from "./types"
import { cn } from "@/lib/cn"

type ToggleGroupContextValue = {
  value: string | string[]
  setValue: (v: string) => void
  multiple: boolean
  disabled: boolean
  name: string | undefined
  size: "sm" | "md" | "lg"
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null)

function useToggleGroupContext() {
  const ctx = useContext(ToggleGroupContext)
  if (!ctx) throw new Error("ToggleGroup.Option must be used within ToggleGroup")
  return ctx
}

const sizeClasses = {
  sm: "h-8 px-2.5 text-xs",
  md: "h-9 px-3 text-sm",
  lg: "h-10 px-4 text-sm",
}

export const ToggleGroup: FC<ToggleGroupProps> = ({
  className,
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  multiple = false,
  name,
  disabled = false,
  size = "md",
  ...divProps
}) => {
  const isControlled = valueProp !== undefined
  const [uncontrolled, setUncontrolled] = useState<string | string[]>(() => {
    if (defaultValue !== undefined) return defaultValue
    return multiple ? [] : ""
  })
  const value = isControlled
    ? (valueProp as string | string[])
    : uncontrolled

  const normalizedValue = useMemo(() => {
    if (multiple) return Array.isArray(value) ? value : value ? [value] : []
    return typeof value === "string" ? value : Array.isArray(value) ? value[0] ?? "" : ""
  }, [multiple, value])

  const setValue = useCallback(
    (v: string) => {
      if (multiple) {
        const arr = Array.isArray(normalizedValue) ? normalizedValue : []
        const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
        if (!isControlled) setUncontrolled(next)
        onValueChange?.(next)
      } else {
        if (!isControlled) setUncontrolled(v)
        onValueChange?.(v)
      }
    },
    [isControlled, multiple, normalizedValue, onValueChange]
  )

  const generatedId = useId()
  const baseName = name ?? `toggle-${generatedId}`

  const ctx = useMemo<ToggleGroupContextValue>(
    () => ({
      value: normalizedValue,
      setValue,
      multiple,
      disabled,
      name: baseName,
      size,
    }),
    [disabled, multiple, normalizedValue, setValue, baseName, size]
  )

  return (
    <ToggleGroupContext.Provider value={ctx}>
      <div
        {...divProps}
        role={multiple ? "group" : "radiogroup"}
        aria-label={divProps["aria-label"] ?? (multiple ? "Toggle group" : "Select one")}
        className={cn(
          "inline-flex rounded-lg border border-(--pw-border) bg-background/10 p-0.5",
          disabled && "opacity-60",
          className
        )}
      >
        {options.map((opt) => (
          <ToggleGroupOption key={opt.value} option={opt} />
        ))}
      </div>
      {name && !multiple && typeof normalizedValue === "string" && normalizedValue ? (
        <input type="hidden" name={name} value={normalizedValue} />
      ) : null}
      {name && multiple && Array.isArray(normalizedValue)
        ? normalizedValue.map((v) => <input key={v} type="hidden" name={name} value={v} />)
        : null}
    </ToggleGroupContext.Provider>
  )
}

function ToggleGroupOption({ option }: { option: ToggleGroupOption }) {
  const { value, setValue, multiple, disabled, name, size } = useToggleGroupContext()
  const selected = multiple
    ? (Array.isArray(value) && value.includes(option.value))
    : value === option.value
  const optionDisabled = disabled || option.disabled

  const handleClick = useCallback(() => {
    if (optionDisabled) return
    setValue(option.value)
  }, [option.value, optionDisabled, setValue])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        handleClick()
      }
    },
    [handleClick]
  )

  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
      disabled={optionDisabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      name={multiple ? undefined : name}
      value={option.value}
      className={cn(
        "rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
        sizeClasses[size],
        optionDisabled ? "cursor-not-allowed text-foreground/40" : "text-foreground/85 hover:bg-background/15",
        selected ? "bg-accent/20 text-accent-foreground" : ""
      )}
    >
      {option.label}
    </button>
  )
}
