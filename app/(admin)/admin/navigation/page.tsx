import { getNavigationTree } from "@/lib/supabase/server"
import Link from "next/link"
import { Plus, Edit } from "lucide-react"

export default async function AdminNavigation() {
  const navigationTree = await getNavigationTree()

  const renderNavItem = (item: any, level = 0) => {
    return (
      <div key={item.id} className={level > 0 ? "ml-6 mt-2" : ""}>
        <div className="flex items-center justify-between rounded-lg border border-(--pw-border) bg-secondary/20 p-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-8 w-8 items-center justify-center rounded border border-(--pw-border) bg-background/10 text-xs font-semibold text-foreground/80"
              style={{ marginLeft: `${level * 1.5}rem` }}
            >
              {item.order_index || 0}
            </div>
            <div>
              <div className="font-semibold text-foreground">
                {item.label}
              </div>
              <div className="text-sm text-foreground/70">
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
            <Link
              href={`/admin/navigation/${item.id}`}
              className="text-foreground/75 hover:text-foreground"
            >
              <Edit className="h-4 w-4" />
            </Link>
          </div>
        </div>
        {item.children && item.children.length > 0 && (
          <div className="mt-2">
            {item.children.map((child: any) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    )
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
          href="/admin/navigation?new=true"
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
            href="/admin/navigation?new=true"
            className="mt-4 inline-block text-sm font-semibold text-foreground underline"
          >
            Add your first navigation item
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {navigationTree.map((item) => renderNavItem(item))}
        </div>
      )}
    </div>
  )
}
