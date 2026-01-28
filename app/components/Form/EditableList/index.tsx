"use client"
import { useCallback, useMemo, useRef, useState, type FC } from "react"
import type { EditableListProps } from "./types"
import { cn } from "@/lib/cn"
import { SortableList } from "@/app/components/SortableList"
import { Button } from "@/app/components/Button"
import { Input } from "../Input"
import { Plus, Trash2 } from "lucide-react"

type Row = { id: string; value: string }

function toRows(values: string[]) {
  return values.map((v, i) => ({ id: `${i}-${Math.random().toString(16).slice(2)}`, value: v }))
}

export const EditableList: FC<EditableListProps> = ({
  className,
  name,
  value: valueProp,
  defaultValue,
  onValueChange,
  placeholder = "Enter a value…",
  addLabel = "Add item",
  disabled = false,
  ...divProps
}) => {
  const isControlled = Array.isArray(valueProp)
  const [uncontrolledRows, setUncontrolledRows] = useState<Row[]>(() => toRows(defaultValue ?? []))

  const rows = useMemo<Row[]>(() => {
    return isControlled ? toRows(valueProp as string[]) : uncontrolledRows
  }, [isControlled, uncontrolledRows, valueProp])

  const rowsRef = useRef<Row[]>(rows)
  rowsRef.current = rows

  const emit = useCallback(
    (nextRows: Row[]) => {
      const nextValues = nextRows.map((r) => r.value)
      if (!isControlled) setUncontrolledRows(nextRows)
      onValueChange?.(nextValues)
    },
    [isControlled, onValueChange]
  )

  const add = useCallback(() => {
    if (disabled) return
    const next = [...rowsRef.current, { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, value: "" }]
    emit(next)
    // focus will naturally land on the new input when user tabs/clicks; we keep it simple
  }, [disabled, emit])

  const remove = useCallback(
    (id: string) => {
      if (disabled) return
      const next = rowsRef.current.filter((r) => r.id !== id)
      emit(next)
    },
    [disabled, emit]
  )

  const updateValue = useCallback(
    (id: string, value: string) => {
      const next = rowsRef.current.map((r) => (r.id === id ? { ...r, value } : r))
      emit(next)
    },
    [emit]
  )

  return (
    <div {...divProps} className={cn("space-y-2", className)}>
      <SortableList
        items={rows}
        disabled={disabled}
        onReorder={emit}
        itemClassName="rounded-lg border border-(--pw-border) bg-background/10 p-3 pl-12"
        renderItem={(row) => (
          <div className="flex items-center gap-2">
            <Input
              name={name}
              value={row.value}
              onChange={(e) => updateValue(row.id, e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "h-10 flex-1 rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none",
                "transition-colors",
                "focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
                disabled ? "opacity-60" : "hover:bg-background/15"
              )}
            />
            <Button
              type="button"
              variant="icon"
              onClick={() => remove(row.id)}
              disabled={disabled}
              className="h-10 w-10 rounded-lg border border-(--pw-border) bg-background/10 text-foreground/80 hover:bg-background/15"
              aria-label="Delete item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
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
    </div>
  )
}

