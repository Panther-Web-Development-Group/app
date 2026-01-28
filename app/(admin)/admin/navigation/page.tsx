import { getNavigationTree } from "@/lib/supabase/server"
import { createClient } from "@/app/supabase/services/server"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { Plus } from "lucide-react"
import { NavigationSortableTree, type NavigationNode } from "./NavigationSortableTree"

export default async function AdminNavigation() {
  const navigationTree = await getNavigationTree()

  async function updateNavigationOrder(updates: { id: string; order_index: number }[]) {
    "use server"
    const supabase = await createClient()
    for (const u of updates) {
      const { error } = await supabase
        .from("navigation_items")
        .update({ order_index: u.order_index })
        .eq("id", u.id)
      if (error) return { error: error.message }
    }
    revalidatePath("/admin/navigation")
    return {}
  }

  async function deleteNavigationItem(id: string) {
    "use server"
    const supabase = await createClient()
    // If the item is a parent, detach children first to avoid FK errors.
    const { error: detachError } = await supabase
      .from("navigation_items")
      .update({ parent_id: null })
      .eq("parent_id", id)
    if (detachError) return { error: detachError.message }

    const { error } = await supabase.from("navigation_items").delete().eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/admin/navigation")
    return {}
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Navigation
          </h2>
          <p className="mt-2 text-foreground/75">
            Manage your site navigation menu
          </p>
        </div>
        <Link
          href="/admin/navigation/new"
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Link>
      </div>

      {!navigationTree || navigationTree.length === 0 ? (
        <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-12 text-center">
          <p className="text-foreground/75">
            No navigation items found.
          </p>
          <Link
            href="/admin/navigation/new"
            className="mt-4 inline-block text-sm font-semibold text-foreground underline"
          >
            Add your first navigation item
          </Link>
        </div>
      ) : (
        <NavigationSortableTree
          initialTree={navigationTree as NavigationNode[]}
          updateOrder={updateNavigationOrder}
          deleteItem={deleteNavigationItem}
        />
      )}
    </div>
  )
}
