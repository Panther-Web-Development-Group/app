"use client"

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type FC,
  type KeyboardEvent,
} from "react"
import type { TagsProps } from "./types"
import { cn } from "@/lib/cn"
import { X } from "lucide-react"

function defaultNormalize(tag: string) {
  return tag.trim().replaceAll(/\s+/g, " ")
}

function splitTags(raw: string) {
  return raw
    .split(/[,;\n\r\t]/g)
    .map((s) => s.trim())
    .filter(Boolean)
}

export const Tags: FC<TagsProps> = ({
  className,
  name,
  disabled,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  placeholder = "Add tag…",
  allowDuplicates = false,
  max,
  normalize = defaultNormalize,
  ...divProps
}) => {
  const isControlled = Array.isArray(valueProp)
  const [uncontrolled, setUncontrolled] = useState<string[]>(defaultValue)
  const value = (isControlled ? (valueProp as string[]) : uncontrolled) ?? []

  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState("")

  const setValue = useCallback(
    (next: string[]) => {
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )

  const canAddMore = useMemo(() => {
    if (typeof max !== "number") return true
    return value.length < max
  }, [max, value.length])

  const addMany = useCallback(
    (raw: string) => {
      if (disabled) return
      const parts = splitTags(raw).map(normalize).filter(Boolean)
      if (parts.length === 0) return

      let next = value.slice()
      for (const t of parts) {
        if (!t) continue
        if (!allowDuplicates && next.includes(t)) continue
        if (typeof max === "number" && next.length >= max) break
        next.push(t)
      }

      if (next !== value) setValue(next)
      setDraft("")
    },
    [allowDuplicates, disabled, max, normalize, setValue, value]
  )

  const removeAt = useCallback(
    (idx: number) => {
      if (disabled) return
      const next = value.filter((_, i) => i !== idx)
      setValue(next)
    },
    [disabled, setValue, value]
  )

  const focusInput = useCallback(() => {
    if (disabled) return
    inputRef.current?.focus()
  }, [disabled])

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === "," || e.key === ";") {
        e.preventDefault()
        if (!canAddMore) return
        addMany(draft)
        return
      }

      if (e.key === "Backspace" && draft.length === 0 && value.length > 0) {
        e.preventDefault()
        removeAt(value.length - 1)
      }
    },
    [addMany, canAddMore, draft, removeAt, value.length]
  )

  const onPaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      const text = e.clipboardData.getData("text")
      if (!text) return
      const parts = splitTags(text)
      if (parts.length <= 1) return
      e.preventDefault()
      if (!canAddMore) return
      addMany(text)
    },
    [addMany, canAddMore]
  )

  return (
    <div
      {...divProps}
      className={cn(
        "rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2",
        "transition-colors",
        disabled ? "opacity-60" : "hover:bg-background/15",
        className
      )}
      onMouseDown={(e) => {
        // keep clicks inside from blurring the input
        if (e.target === e.currentTarget) focusInput()
        divProps.onMouseDown?.(e)
      }}
      data-disabled={disabled ? "" : undefined}
    >
      {!disabled && name
        ? value.map((t, i) => <input key={`${t}-${i}`} type="hidden" name={name} value={t} />)
        : null}

      <div className="flex flex-wrap items-center gap-2">
        {value.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-(--pw-border) bg-background/10 px-2 py-1 text-xs font-semibold text-foreground/80",
              "shadow-[0_10px_30px_var(--pw-shadow)]"
            )}
          >
            <span className="max-w-[18rem] truncate">{t}</span>
            {!disabled ? (
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-foreground/70 hover:bg-background/20"
                aria-label={`Remove ${t}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </span>
        ))}

        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          disabled={disabled || !canAddMore}
          placeholder={canAddMore ? placeholder : "Max reached"}
          className={cn(
            "min-w-[10rem] flex-1 bg-transparent py-1 text-sm text-foreground outline-none",
            "placeholder:text-foreground/50"
          )}
        />
      </div>
    </div>
  )
}

