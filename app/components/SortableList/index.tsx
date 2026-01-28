 "use client"
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/cn"
import { GripVertical } from "lucide-react"

type Id = string

function arrayMove<T>(arr: T[], from: number, to: number) {
  if (from === to) return arr
  const next = arr.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export type SortableListRenderState = {
  isDragging: boolean
  isOver: boolean
  handleProps: {
    draggable: true
    onDragStart: (e: React.DragEvent) => void
    onDragEnd: (e: React.DragEvent) => void
    "aria-grabbed": boolean
  }
}

export type SortableListProps<T extends { id: Id }> = {
  items: T[]
  onReorder: (next: T[]) => void
  onReorderEnd?: (next: T[]) => void

  className?: string
  itemClassName?: string

  renderItem: (item: T, state: SortableListRenderState) => ReactNode
  getId?: (item: T) => Id
  disabled?: boolean
}

export function SortableList<T extends { id: Id }>(props: SortableListProps<T>) {
  const {
    items,
    onReorder,
    onReorderEnd,
    className,
    itemClassName,
    renderItem,
    getId = (i) => i.id,
    disabled = false,
  } = props

  const [draggingId, setDraggingId] = useState<Id | null>(null)
  const [overId, setOverId] = useState<Id | null>(null)
  const didDropRef = useRef(false)

  const ids = useMemo(() => items.map(getId), [getId, items])

  const handleDragStart = useCallback(
    (id: Id) => (e: React.DragEvent) => {
      if (disabled) return
      didDropRef.current = false
      setDraggingId(id)
      setOverId(id)
      e.stopPropagation()
      e.dataTransfer.effectAllowed = "move"
      // Required for Firefox
      e.dataTransfer.setData("text/plain", id)
    },
    [disabled]
  )

  const handleDragEnd = useCallback(
    (_id: Id) => (_e: React.DragEvent) => {
      const dropped = didDropRef.current
      didDropRef.current = false
      setDraggingId(null)
      setOverId(null)
      if (dropped) onReorderEnd?.(items)
    },
    [items, onReorderEnd]
  )

  const handleDragOverItem = useCallback(
    (id: Id) => (e: React.DragEvent) => {
      if (disabled) return
      if (!draggingId) return
      e.preventDefault()
      e.stopPropagation()
      if (id === overId) return
      setOverId(id)

      const from = ids.indexOf(draggingId)
      const to = ids.indexOf(id)
      if (from === -1 || to === -1) return

      onReorder(arrayMove(items, from, to))
    },
    [disabled, draggingId, ids, items, onReorder, overId]
  )

  const handleDrop = useCallback(
    (_id: Id) => (e: React.DragEvent) => {
      if (disabled) return
      if (!draggingId) return
      e.preventDefault()
      e.stopPropagation()
      didDropRef.current = true
    },
    [disabled, draggingId]
  )

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => {
        const id = getId(item)
        const isDragging = draggingId === id
        const isOver = overId === id && draggingId !== id

        const handleProps = {
          draggable: true as const,
          onDragStart: handleDragStart(id),
          onDragEnd: handleDragEnd(id),
          "aria-grabbed": isDragging,
        }

        return (
          <div
            key={id}
            onDragOver={handleDragOverItem(id)}
            onDrop={handleDrop(id)}
            className={cn(
              "group relative",
              disabled ? "opacity-70" : "",
              itemClassName
            )}
            data-dragging={isDragging ? "" : undefined}
            data-over={isOver ? "" : undefined}
          >
            {renderItem(item, { isDragging, isOver, handleProps })}

            {!disabled ? (
              <span
                {...handleProps}
                role="button"
                tabIndex={0}
                aria-label="Drag to reorder"
                className={cn(
                  "absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500",
                  "opacity-0 transition-opacity group-hover:opacity-100",
                  isDragging ? "opacity-100" : "",
                )}
              >
                <GripVertical className="h-4 w-4" />
              </span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

