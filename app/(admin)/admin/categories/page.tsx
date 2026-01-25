import { revalidatePath } from "next/cache"
import { createClient } from "@/app/supabase/services/server"
import { Button } from "@/app/components/Button"

type CategoryRow = {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  icon: string | null
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  async function createCategory(formData: FormData) {
    "use server"

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const name = String(formData.get("name") ?? "").trim()
    const slugRaw = String(formData.get("slug") ?? "").trim()
    const slug = slugify(slugRaw || name)
    const description = String(formData.get("description") ?? "").trim() || null
    const color = String(formData.get("color") ?? "").trim() || null
    const icon = String(formData.get("icon") ?? "").trim() || null
    const orderIndex = Number(formData.get("order_index") ?? 0) || 0
    const isActive = formData.get("is_active") === "on"

    if (!name || !slug) return

    const { error } = await supabase.from("categories").insert({
      owner_id: user.id,
      name,
      slug,
      description,
      color,
      icon,
      order_index: orderIndex,
      is_active: isActive,
    })

    if (error) {
      console.error("Error creating category:", error)
      return
    }

    revalidatePath("/admin/categories")
  }

  async function toggleActive(formData: FormData) {
    "use server"

    const id = String(formData.get("id") ?? "")
    const next = formData.get("next") === "true"
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase
      .from("categories")
      .update({ is_active: next })
      .eq("id", id)

    if (error) {
      console.error("Error updating category:", error)
      return
    }

    revalidatePath("/admin/categories")
  }

  async function deleteCategory(formData: FormData) {
    "use server"

    const id = String(formData.get("id") ?? "")
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase.from("categories").delete().eq("id", id)

    if (error) {
      console.error("Error deleting category:", error)
      return
    }

    revalidatePath("/admin/categories")
  }

  const { data: categories } = user
    ? await supabase
        .from("categories")
        .select(
          "id, owner_id, name, slug, description, color, icon, order_index, is_active, created_at, updated_at"
        )
        .eq("owner_id", user.id)
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: false })
    : { data: [] as CategoryRow[] }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Categories</h2>
        <p className="mt-2 text-foreground/75">Manage your content categories</p>
      </div>

      <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-foreground">Create Category</h3>
        <form action={createCategory} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label className="text-sm font-semibold text-foreground/80">Name</label>
            <input
              name="name"
              required
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="text-sm font-semibold text-foreground/80">Slug (optional)</label>
            <input
              name="slug"
              placeholder="auto-from-name"
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Description (optional)</label>
            <textarea
              name="description"
              rows={3}
              className="mt-1 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground/80">Color (optional)</label>
            <input
              name="color"
              placeholder="#1e40af"
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground/80">Icon (optional)</label>
            <input
              name="icon"
              placeholder="lucide icon name"
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground/80">Order</label>
            <input
              name="order_index"
              type="number"
              defaultValue={0}
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="flex items-end gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <input type="checkbox" name="is_active" defaultChecked className="h-4 w-4" />
              Active
            </label>
          </div>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
              variant="ghost"
            >
              Create
            </Button>
          </div>
        </form>
      </div>

      {!categories || categories.length === 0 ? (
        <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-12 text-center">
          <p className="text-foreground/75">No categories yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-(--pw-border) bg-secondary/20">
          <table className="min-w-full divide-y divide-(--pw-border)">
            <thead className="bg-secondary/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--pw-border)">
              {categories.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-foreground">{c.name}</div>
                    {c.description ? (
                      <div className="mt-1 text-xs text-foreground/70">
                        {c.description.substring(0, 80)}
                        {c.description.length > 80 ? "…" : ""}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <code className="rounded border border-(--pw-border) bg-background/10 px-2 py-1 text-xs text-foreground/85">
                      {c.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    {c.is_active ? (
                      <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full border border-(--pw-border) bg-background/10 px-2.5 py-0.5 text-xs font-semibold text-foreground/80">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <form action={toggleActive}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="next" value={String(!c.is_active)} />
                        <Button
                          type="submit"
                          className="rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-background/20"
                          variant="ghost"
                        >
                          {c.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </form>
                      <form action={deleteCategory}>
                        <input type="hidden" name="id" value={c.id} />
                        <Button
                          type="submit"
                          className="rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-background/20"
                          variant="ghost"
                        >
                          Delete
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

