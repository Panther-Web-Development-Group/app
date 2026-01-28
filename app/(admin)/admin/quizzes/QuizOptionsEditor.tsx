"use client"

import { useCallback, useEffect, useRef, useState, type FC, type ChangeEvent } from "react"
import { cn } from "@/lib/cn"
import { SortableList } from "@/app/components/SortableList"
import { Button } from "@/app/components/Button"
import { Input } from "@/app/components/Form/Input"
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react"

type Option = { id: string; value: string }

type QuizOptionsEditorProps = {
  name: string
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  correctIndex?: number | null
  onCorrectIndexChange?: (index: number | null) => void
  placeholder?: string
  addLabel?: string
  disabled?: boolean
  className?: string
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const QuizOptionsEditor: FC<QuizOptionsEditorProps> = ({
  name,
  value: valueProp,
  defaultValue,
  onValueChange,
  correctIndex: correctIndexProp,
  onCorrectIndexChange,
  placeholder = "Enter option text…",
  addLabel = "Add option",
  disabled = false,
  className,
}) => {
  const isControlled = Array.isArray(valueProp)
  
  // Always maintain internal state with stable IDs
  const [internalOptions, setInternalOptions] = useState<Option[]>(() => {
    const initial = isControlled ? (valueProp as string[]) : (defaultValue ?? [])
    return initial.map((v) => ({ id: generateId(), value: v }))
  })

  // Track if we're the one making changes to avoid sync loops
  const isInternalUpdateRef = useRef(false)
  const prevExternalValueRef = useRef<string[]>(isControlled ? (valueProp as string[]) : [])

  // Sync external controlled values only when they change externally (not from our updates)
  useEffect(() => {
    if (!isControlled) return
    
    const externalValues = valueProp as string[]
    const prevExternal = prevExternalValueRef.current
    
    // Only sync if:
    // 1. Values actually changed (not just reference)
    // 2. It's not an internal update (we set this flag when we emit)
    const valuesChanged = 
      externalValues.length !== prevExternal.length ||
      externalValues.some((v, i) => v !== prevExternal[i])
    
    if (valuesChanged && !isInternalUpdateRef.current) {
      // External change - sync to internal state while preserving IDs
      setTimeout(() => setInternalOptions((current) => {
        return externalValues.map((value, index) => {
          // Try to find existing option with same value at same position
          const existing = current[index]
          if (existing && existing.value === value) {
            return existing // Reuse same object to preserve ID
          }
          // Try to find elsewhere
          const found = current.find((o) => o.value === value)
          if (found) return found
          // New option
          return { id: generateId(), value }
        })
      }), 0)
      prevExternalValueRef.current = externalValues
    }
    
    // Reset flag after processing
    isInternalUpdateRef.current = false
  }, [isControlled, valueProp])

  
  const optionsRef = useRef<Option[]>(internalOptions)

  useEffect(() => {
    optionsRef.current = internalOptions
  }, [])

  const isCorrectIndexControlled = correctIndexProp !== undefined
  const [uncontrolledCorrectIndex, setUncontrolledCorrectIndex] = useState<number | null>(null)
  const correctIndex = isCorrectIndexControlled ? correctIndexProp : uncontrolledCorrectIndex

  const emitOptions = useCallback(
    (nextOptions: Option[]) => {
      const nextValues = nextOptions.map((o) => o.value)
      // Update internal state immediately
      setInternalOptions(nextOptions)
      // Mark as internal update to prevent sync loop
      isInternalUpdateRef.current = true
      // Emit to parent
      onValueChange?.(nextValues)
    },
    [onValueChange]
  )

  const emitCorrectIndex = useCallback(
    (next: number | null) => {
      if (!isCorrectIndexControlled) setUncontrolledCorrectIndex(next)
      onCorrectIndexChange?.(next)
    },
    [isCorrectIndexControlled, onCorrectIndexChange]
  )

  const add = useCallback(() => {
    if (disabled) return
    const next = [...optionsRef.current, { id: generateId(), value: "" }]
    emitOptions(next)
  }, [disabled, emitOptions])

  const remove = useCallback(
    (id: string) => {
      if (disabled) return
      const optionIndex = optionsRef.current.findIndex((o) => o.id === id)
      const next = optionsRef.current.filter((o) => o.id !== id)
      emitOptions(next)

      // Adjust correct index if needed
      if (correctIndex !== null && optionIndex !== -1) {
        if (correctIndex === optionIndex) {
          emitCorrectIndex(null)
        } else if (correctIndex > optionIndex) {
          emitCorrectIndex(correctIndex - 1)
        }
      }
    },
    [disabled, emitOptions, correctIndex, emitCorrectIndex]
  )

  const updateValue = useCallback(
    (id: string, value: string) => {
      // Update internal state immediately (keeps input focused)
      setInternalOptions((prev) => 
        prev.map((o) => o.id === id ? { ...o, value } : o)
      )
      
      // Emit to parent
      const current = optionsRef.current
      const next = current.map((o) => o.id === id ? { ...o, value } : o)
      const nextValues = next.map((o) => o.value)
      isInternalUpdateRef.current = true
      onValueChange?.(nextValues)
    },
    [onValueChange]
  )

  const setCorrect = useCallback(
    (index: number) => {
      if (disabled) return
      const newIndex = correctIndex === index ? null : index
      emitCorrectIndex(newIndex)
    },
    [disabled, correctIndex, emitCorrectIndex]
  )

  return (
    <div className={cn("space-y-2", className)}>
      <SortableList
        items={internalOptions}
        disabled={disabled}
        onReorder={emitOptions}
        itemClassName="rounded-lg border border-(--pw-border) bg-background/10 p-3 pl-12"
        renderItem={(option, index) => {
          const isCorrect = correctIndex === index
          return (
            <div key={option.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCorrect(index)}
                disabled={disabled}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-(--pw-border) bg-background/10 transition-colors",
                  disabled ? "cursor-not-allowed opacity-60" : "hover:bg-background/20",
                  isCorrect && "bg-success/15 border-success/30"
                )}
                aria-label={isCorrect ? "Mark as incorrect" : "Mark as correct answer"}
                title={isCorrect ? "Correct answer - click to unmark" : "Click to mark as correct answer"}
              >
                {isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-foreground/50" />
                )}
              </button>
              <Input
                name={name}
                value={option.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateValue(option.id, e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "h-10 flex-1 rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none",
                  "transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
                  disabled ? "opacity-60" : "hover:bg-background/15",
                  isCorrect && "ring-1 ring-success/30"
                )}
              />
              <Button
                type="button"
                variant="icon"
                onClick={() => remove(option.id)}
                disabled={disabled}
                className="h-10 w-10 rounded-lg border border-(--pw-border) bg-background/10 text-foreground/80 hover:bg-background/15"
                aria-label="Delete option"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        }}
      />

      <Button
        type="button"
        onClick={add}
        disabled={disabled}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm font-semibold text-foreground/80 hover:bg-background/15"
        variant="ghost"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>

      {correctIndex !== null && (
        <div className="text-xs text-foreground/70">
          ✓ Correct answer: Option {correctIndex + 1}
        </div>
      )}

      {/* Hidden inputs for form submission */}
      {internalOptions.map((opt, optIdx) => (
        <input
          key={`${opt.id}-hidden`}
          type="hidden"
          name={name}
          value={opt.value}
        />
      ))}
    </div>
  )
}
