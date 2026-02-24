"use client"

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FC,
  type KeyboardEvent,
  type MouseEvent,
} from "react"
import { createPortal } from "react-dom"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/cn"

const GAP = 4

const TOOLBAR_INPUT_CLASSES =
  "h-8 flex-1 min-w-0 rounded-md border-0 bg-transparent px-2 text-center text-xs font-medium text-foreground/90 outline-none focus:ring-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
const TOOLBAR_WRAPPER_CLASSES =
  "inline-flex h-8 w-full items-center gap-1 rounded-md border border-foreground/10 dark:border-foreground/20 bg-background hover:bg-foreground/5 dark:hover:bg-foreground/10 focus-within:ring-2 focus-within:ring-(--pw-ring) focus-within:ring-offset-1 overflow-hidden"

/** Preset sizes similar to Google Docs */
const DEFAULT_PRESET_SIZES = [8, 9, 10, 11, 12, 14, 18, 24, 36, 48, 72, 96]

const MIN_SIZE = 1
const MAX_SIZE = 400

function clampSize(n: number): number {
  return Math.round(Math.max(MIN_SIZE, Math.min(MAX_SIZE, n)))
}

export interface RTEFontSizeProps {
  value: number
  onValueChange: (size: number) => void
  /** Preset sizes shown in the dropdown (default: Google Docs–style list) */
  presetSizes?: number[]
  min?: number
  max?: number
  disabled?: boolean
  className?: string
  inputClassName?: string
  contentClassName?: string
  /** When provided, called on Escape (e.g. focus editor) */
  onEscape?: () => void
}

/**
 * Font size control for the RTE toolbar, similar to Google Docs: an input
 * showing the current size with a dropdown of preset sizes. Users can pick
 * a preset or type a custom size (on Enter/blur).
 */
export const RTEFontSize: FC<RTEFontSizeProps> = ({
  value,
  onValueChange,
  presetSizes = DEFAULT_PRESET_SIZES,
  min = MIN_SIZE,
  max = MAX_SIZE,
  disabled,
  className,
  inputClassName,
  contentClassName,
  onEscape,
}) => {
  const [open, setOpen] = useState(false)
  const [inputText, setInputText] = useState(String(value))
  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isClickingPresetRef = useRef(false)
  const generatedId = useId()
  const listboxId = `${generatedId}-font-size-list`

  const clampedValue = clampSize(value)
  const effectiveMin = Math.max(MIN_SIZE, min)
  const effectiveMax = Math.min(MAX_SIZE, max)

  // Sync input text when value changes externally (e.g. selection change)
  useEffect(() => {
    setInputText(String(clampedValue))
  }, [clampedValue])

  // Clear blur timeout when value changes externally (avoid overwriting selection change) and on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }, [clampedValue])

  // Clear isClickingPresetRef on mouseup (user may mousedown then release outside)
  useEffect(() => {
    const onMouseUp = () => {
      if (isClickingPresetRef.current) isClickingPresetRef.current = false
    }
    document.addEventListener("mouseup", onMouseUp)
    return () => document.removeEventListener("mouseup", onMouseUp)
  }, [])

  // Position dropdown with fixed positioning (escapes overflow containers like RTE toolbar)
  useEffect(() => {
    if (!open || !contentRef.current || !rootRef.current) return
    const content = contentRef.current
    const trigger = rootRef.current
    const rect = trigger.getBoundingClientRect()
    const vh = window.innerHeight
    const viewportPad = 8
    content.style.top = `${rect.bottom + GAP}px`
    content.style.left = `${rect.left}px`
    content.style.width = `${rect.width}px`
    content.style.minWidth = "4rem"
    // Flip above if not enough space below
    const spaceBelow = vh - viewportPad - rect.bottom
    if (spaceBelow < 120 && rect.top - viewportPad > spaceBelow) {
      content.style.top = "auto"
      content.style.bottom = `${vh - rect.top + GAP}px`
    }
  }, [open])

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: globalThis.MouseEvent | TouchEvent) => {
      const target = e.target instanceof Node ? e.target : null
      if (!target) return
      const root = rootRef.current
      const content = contentRef.current
      if (root?.contains(target) || content?.contains(target)) return
      setOpen(false)
    }

    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        onEscape?.()
      }
    }

    const controller = new AbortController()
    const { signal } = controller
    document.addEventListener("mousedown", onPointerDown, { signal })
    document.addEventListener("touchstart", onPointerDown, { passive: true, signal })
    document.addEventListener("keydown", onKeyDown, { signal })
    return () => controller.abort()
  }, [open, onEscape])

  const applySize = useCallback(
    (size: number) => {
      const next = Math.max(effectiveMin, Math.min(effectiveMax, Math.round(size)))
      setInputText(String(next))
      onValueChange(next)
    },
    [effectiveMin, effectiveMax, onValueChange]
  )

  const handleInputFocus = useCallback(() => {
    if (disabled) return
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setOpen(true)
    setInputText(String(clampedValue))
  }, [disabled, clampedValue])

  const handleInputBlur = useCallback(() => {
    if (isClickingPresetRef.current) return // Preset click will handle - avoid race

    const textToApply = inputText
    const fallbackValue = clampedValue

    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null
      const parsed = parseInt(textToApply, 10)
      if (Number.isFinite(parsed)) {
        applySize(parsed)
      } else {
        setInputText(String(fallbackValue))
      }
      setOpen(false)
    }, 150)
  }, [inputText, applySize, clampedValue])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
  }, [])

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        const parsed = parseInt(inputText, 10)
        if (Number.isFinite(parsed)) {
          applySize(parsed)
        }
        setOpen(false)
        inputRef.current?.blur()
      }
    },
    [inputText, applySize]
  )

  const handlePresetMouseDown = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    isClickingPresetRef.current = true
    e.preventDefault()
  }, [])

  const handlePresetClick = useCallback(
    (size: number) => {
      isClickingPresetRef.current = false
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      applySize(size)
      setOpen(false)
      inputRef.current?.blur()
    },
    [applySize]
  )

  const filteredPresets = presetSizes.filter((s) => s >= effectiveMin && s <= effectiveMax)

  const handleChevronClick = useCallback(() => {
    if (disabled) return
    setOpen(true)
    inputRef.current?.focus()
  }, [disabled])

  return (
    <div
      ref={rootRef}
      className={cn("relative shrink-0", className)}
      data-disabled={disabled ? "" : undefined}
    >
      <div
        className={cn(TOOLBAR_WRAPPER_CLASSES, "w-[64px]", inputClassName)}
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={inputText}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-label="Font size"
          className={TOOLBAR_INPUT_CLASSES}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={handleChevronClick}
          disabled={disabled}
          aria-label="Open font size list"
          className="flex shrink-0 items-center justify-center text-foreground/70 hover:text-foreground mr-1.5 h-full"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={contentRef}
            id={listboxId}
            role="listbox"
            aria-label="Font size presets"
            className={cn(
              "z-9999 max-h-[min(16rem,70vh)] min-w-16 overflow-auto rounded-lg border border-foreground/10 dark:border-foreground/20 bg-background py-1 shadow-lg",
              contentClassName
            )}
            style={{ position: "fixed" }}
          >
            {filteredPresets.map((size) => (
              <button
                key={size}
                type="button"
                role="option"
                aria-selected={clampedValue === size}
                onMouseDown={handlePresetMouseDown}
                onClick={() => handlePresetClick(size)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-center px-3 py-1.5 text-left text-sm text-foreground transition-colors",
                  "hover:bg-background/20 active:bg-background/30",
                  clampedValue === size && "bg-background/15 font-medium"
                )}
              >
                {size}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  )
}
