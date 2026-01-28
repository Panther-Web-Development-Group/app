import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/app/supabase/services/server"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { Checkbox } from "@/app/components/Form/Checkbox"
import { ConfirmActionForm } from "../ConfirmActionForm"
import { Select, SelectContent, SelectOption, SelectTrigger } from "@/app/components/Form/Select"

type NavigationItemRow = {
  id: string
  label: string
  href: string | null
  is_active: boolean
  order_index: number | null
  parent_id: string | null
}

export default async function AdminNavigationItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: item, error: itemError } = await supabase
    .from("navigation_items")
    .select("id, label, href, is_active, order_index, parent_id")
    .eq("id", id)
    .maybeSingle<NavigationItemRow>()

  if (itemError) {
    console.error("Error fetching navigation item:", itemError)
    notFound()
  }
  if (!item) notFound()

  const { data: allItems } = await supabase
    .from("navigation_items")
    .select("id, label, parent_id")
    .order("label", { ascending: true })

  async function updateNavigationItem(formData: FormData) {
    "use server"
    const supabase = await createClient()

    const label = String(formData.get("label") ?? "").trim()
    const hrefRaw = String(formData.get("href") ?? "").trim()
    const href = hrefRaw ? hrefRaw : null
    const parentRaw = String(formData.get("parent_id") ?? "").trim()
    const parent_id = parentRaw ? parentRaw : null
    const order_index_raw = String(formData.get("order_index") ?? "").trim()
    const order_index = order_index_raw ? Number(order_index_raw) : undefined
    const is_active = formData.get("is_active") === "on"

    if (!label) return

    const safeParent = parent_id === id ? null : parent_id

    const { error } = await supabase
      .from("navigation_items")
      .update({
        label,
        href,
        parent_id: safeParent,
        order_index: Number.isFinite(order_index as number) ? (order_index as number) : undefined,
        is_active,
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating navigation item:", error)
      return
    }

    revalidatePath("/admin/navigation")
    revalidatePath(`/admin/navigation/${id}`)
    redirect("/admin/navigation")
  }

  async function deleteNavigationItem(_formData: FormData) {
    "use server"
    void _formData
    const supabase = await createClient()

    const { error: detachError } = await supabase
      .from("navigation_items")
      .update({ parent_id: null })
      .eq("parent_id", id)
    if (detachError) {
      console.error("Error detaching children:", detachError)
      return
    }

    const { error } = await supabase.from("navigation_items").delete().eq("id", id)
    if (error) {
      console.error("Error deleting navigation item:", error)
      return
    }

    revalidatePath("/admin/navigation")
    redirect("/admin/navigation")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Edit Navigation Item</h2>
          <p className="mt-2 text-foreground/75">Update label, link, and placement.</p>
        </div>
        <Link
          href="/admin/navigation"
          className="rounded-lg border border-(--pw-border) bg-background/10 px-4 py-2 text-sm font-semibold text-foreground/80 hover:bg-background/20"
        >
          Back
        </Link>
      </div>

      <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-6 space-y-4">
        <form action={updateNavigationItem} className="grid gap-4 sm:grid-cols-2">
          <InputGroup
            className="sm:col-span-2"
            name="label"
            required
            label="Label"
            defaultValue={item.label}
          />

          <InputGroup
            className="sm:col-span-2"
            name="href"
            label="Href (optional)"
            placeholder="/about or https://…"
            defaultValue={item.href ?? ""}
          />

          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Parent (optional)</label>
            <Select name="parent_id" defaultValue={item.parent_id ?? ""} placeholder="None (top-level)">
              <SelectTrigger className="mt-1" />
              <SelectContent>
                <SelectOption value="">None (top-level)</SelectOption>
                {(allItems ?? [])
                  .filter((p) => p.id !== id)
                  .map((p) => (
                    <SelectOption key={p.id} value={p.id}>
                      {p.label}
                    </SelectOption>
                  ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-foreground/70">Tip: parents should usually have no href.</p>
          </div>

          <InputGroup
            name="order_index"
            type="number"
            label="Order (optional)"
            defaultValue={item.order_index ?? undefined}
            min={1}
          />

          <div className="flex items-end gap-3">
            <Checkbox name="is_active" label="Active" defaultChecked={item.is_active} />
          </div>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
              variant="ghost"
            >
              Save
            </Button>
          </div>
        </form>

        <ConfirmActionForm
          action={deleteNavigationItem}
          confirmText={`Delete navigation item "${item.label}"?`}
        >
          <Button
            type="submit"
            className="inline-flex h-10 items-center rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200 dark:hover:bg-red-900/30"
            variant="ghost"
          >
            Delete
          </Button>
        </ConfirmActionForm>
      </div>
    </div>
  )
}

