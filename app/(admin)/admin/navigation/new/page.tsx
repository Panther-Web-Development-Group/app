import Link from "next/link"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/app/supabase/services/server"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { Checkbox } from "@/app/components/Form/Checkbox"
import { Select, SelectContent, SelectOption, SelectTrigger } from "@/app/components/Form/Select"

type NavigationItemRow = {
  id: string
  label: string
  parent_id: string | null
  order_index: number | null
}

export default async function AdminNavigationNewPage() {
  const supabase = await createClient()

  const { data: allItems } = await supabase
    .from("navigation_items")
    .select("id, label, parent_id, order_index")
    .order("label", { ascending: true })
    .returns<NavigationItemRow[]>()

  async function createNavigationItem(formData: FormData) {
    "use server"
    const supabase = await createClient()

    const label = String(formData.get("label") ?? "").trim()
    const hrefRaw = String(formData.get("href") ?? "").trim()
    const href = hrefRaw ? hrefRaw : null
    const parentRaw = String(formData.get("parent_id") ?? "").trim()
    const parent_id = parentRaw ? parentRaw : null
    const orderRaw = String(formData.get("order_index") ?? "").trim()
    const order_index = orderRaw ? Number(orderRaw) : undefined
    const is_active = formData.get("is_active") === "on"

    if (!label) return

    let finalOrder: number | null = null
    if (Number.isFinite(order_index as number)) {
      finalOrder = order_index as number
    } else {
      const { data } = await supabase
        .from("navigation_items")
        .select("order_index")
        .eq("parent_id", parent_id)
        .order("order_index", { ascending: false })
        .limit(1)
      const max = data?.[0]?.order_index ?? 0
      finalOrder = (max || 0) + 1
    }

    const { error } = await supabase.from("navigation_items").insert({
      label,
      href,
      parent_id,
      order_index: finalOrder,
      is_active,
    })

    if (error) {
      console.error("Error creating navigation item:", error)
      return
    }

    revalidatePath("/admin/navigation")
    redirect("/admin/navigation")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Add Navigation Item</h2>
          <p className="mt-2 text-foreground/75">Create a new navigation link or parent item.</p>
        </div>
        <Link
          href="/admin/navigation"
          className="rounded-lg border border-(--pw-border) bg-background/10 px-4 py-2 text-sm font-semibold text-foreground/80 hover:bg-background/20"
        >
          Back
        </Link>
      </div>

      <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-6">
        <form action={createNavigationItem} className="grid gap-4 sm:grid-cols-2">
          <InputGroup
            className="sm:col-span-2"
            name="label"
            required
            label="Label"
            placeholder="Home"
          />

          <InputGroup
            className="sm:col-span-2"
            name="href"
            label="Href (optional)"
            placeholder="/about or https://…"
          />

          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Parent (optional)</label>
            <Select name="parent_id" defaultValue="" placeholder="None (top-level)">
              <SelectTrigger className="mt-1" />
              <SelectContent>
                <SelectOption value="">None (top-level)</SelectOption>
                {(allItems ?? []).map((p) => (
                  <SelectOption key={p.id} value={p.id}>
                    {p.label}
                  </SelectOption>
                ))}
              </SelectContent>
            </Select>
          </div>

          <InputGroup
            name="order_index"
            type="number"
            label="Order (optional)"
            placeholder="(auto)"
            min={1}
          />

          <div className="flex items-end gap-3">
            <Checkbox name="is_active" label="Active" defaultChecked />
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
    </div>
  )
}

