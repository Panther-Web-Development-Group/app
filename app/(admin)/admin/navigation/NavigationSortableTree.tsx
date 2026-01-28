"use client"
import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import { Edit, Trash2 } from "lucide-react"
import { SortableList } from "@/app/components/SortableList"
import { cn } from "@/lib/cn"

export type NavigationNode = {
  id: string
  label: string
  href: string | null
  is_active: boolean
  order_index: number | null
  parent_id: string | null
  children?: NavigationNode[]
}

type UpdateOrder = (updates: { id: string; order_index: number }[]) => Promise<{ error?: string } | void>
type DeleteItem = (id: string) => Promise<{ error?: string } | void>

function renumber(list: NavigationNode[]) {
  return list.map((n, idx) => ({ ...n, order_index: idx + 1 }))
}

function updateChildren(
  tree: NavigationNode[],
  parentId: string | null,
  nextChildren: NavigationNode[]
): NavigationNode[] {
  if (parentId === null) return nextChildren
  return tree.map((n) => {
    if (n.id === parentId) return { ...n, children: nextChildren }
    const children = n.children ?? []
    if (children.length === 0) return n
    return { ...n, children: updateChildren(children, parentId, nextChildren) }
  })
}

export function NavigationSortableTree({
  initialTree,
  updateOrder,
  deleteItem,
  className,
}: {
  initialTree: NavigationNode[]
  updateOrder: UpdateOrder
  deleteItem: DeleteItem
  className?: string
}) {
  const [tree, setTree] = useState<NavigationNode[]>(initialTree)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const persist = useCallback(
    async (updates: { id: string; order_index: number }[]) => {
      setSaving(true)
      setError(null)
      try {
        const res = await updateOrder(updates)
        if (res && "error" in res && res.error) {
          setError(res.error)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update order")
      } finally {
        setSaving(false)
      }
    },
    [updateOrder]
  )

  const removeFromTree = useCallback((nodes: NavigationNode[], id: string): NavigationNode[] => {
    return nodes
      .filter((n) => n.id !== id)
      .map((n) => ({ ...n, children: n.children ? removeFromTree(n.children, id) : n.children }))
  }, [])

  const handleDelete = useCallback(
    async (item: NavigationNode) => {
      if (!confirm(`Delete navigation item "${item.label}"?`)) return
      setSaving(true)
      setError(null)
      try {
        const res = await deleteItem(item.id)
        if (res && "error" in res && res.error) {
          setError(res.error)
          return
        }
        setTree((prev) => removeFromTree(prev, item.id))
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to delete navigation item")
      } finally {
        setSaving(false)
      }
    },
    [deleteItem, removeFromTree]
  )

  const renderLevel = useCallback(
    (items: NavigationNode[], parentId: string | null, level: number) => {
      return (
        <SortableList
          items={items}
          disabled={saving}
          onReorder={(next) => {
            const nextRenumbered = renumber(next)
            setTree((prev) => updateChildren(prev, parentId, nextRenumbered))
          }}
          onReorderEnd={(next) => {
            const nextRenumbered = renumber(next)
            setTree((prev) => updateChildren(prev, parentId, nextRenumbered))
            persist(nextRenumbered.map((n) => ({ id: n.id, order_index: n.order_index ?? 0 })))
          }}
          className={cn(level > 0 ? "mt-2 pl-6" : "", "space-y-2")}
          itemClassName="rounded-lg border border-(--pw-border) bg-secondary/20 p-4 pl-12"
          renderItem={(item) => (
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded border border-(--pw-border) bg-background/10 text-xs font-semibold text-foreground/80">
                    {item.order_index ?? 0}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-foreground">{item.label}</div>
                    <div className="truncate text-sm text-foreground/70">
                      {item.href || "No link (parent item)"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.is_active ? (
                    <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full border border-(--pw-border) bg-background/10 px-2.5 py-0.5 text-xs font-semibold text-foreground/80">
                      Inactive
                    </span>
                  )}
                  <Link href={`/admin/navigation/${item.id}`} className="text-foreground/75 hover:text-foreground">
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="text-foreground/75 hover:text-red-600"
                    aria-label="Delete navigation item"
                    disabled={saving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {item.children && item.children.length > 0 ? renderLevel(item.children, item.id, level + 1) : null}
            </div>
          )}
        />
      )
    },
    [handleDelete, persist, saving]
  )

  const empty = useMemo(() => !tree || tree.length === 0, [tree])

  return (
    <div className={cn("space-y-4", className)}>
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {empty ? (
        <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-12 text-center">
          <p className="text-foreground/75">No navigation items found.</p>
        </div>
      ) : (
        renderLevel(tree, null, 0)
      )}
    </div>
  )
}

