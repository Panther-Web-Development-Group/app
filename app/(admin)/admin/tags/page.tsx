import { revalidatePath } from "next/cache"
import { createClient } from "@/app/supabase/services/server"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { TextAreaGroup } from "@/app/components/Form/TextAreaGroup"
import { Checkbox } from "@/app/components/Form/Checkbox"
import { ColorPicker } from "@/app/components/Form/ColorPicker"

type TagRow = {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  icon: string | null
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

export default async function AdminTagsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  async function createTag(formData: FormData) {
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
    const isActive = formData.get("is_active") === "on"

    if (!name || !slug) return

    const { error } = await supabase.from("tags").insert({
      owner_id: user.id,
      name,
      slug,
      description,
      color,
      icon,
      is_active: isActive,
    })

    if (error) {
      console.error("Error creating tag:", error)
      return
    }

    revalidatePath("/admin/tags")
  }

  async function toggleActive(formData: FormData) {
    "use server"

    const id = String(formData.get("id") ?? "")
    const next = formData.get("next") === "true"
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase.from("tags").update({ is_active: next }).eq("id", id)

    if (error) {
      console.error("Error updating tag:", error)
      return
    }

    revalidatePath("/admin/tags")
  }

  async function deleteTag(formData: FormData) {
    "use server"

    const id = String(formData.get("id") ?? "")
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase.from("tags").delete().eq("id", id)

    if (error) {
      console.error("Error deleting tag:", error)
      return
    }

    revalidatePath("/admin/tags")
  }

  const { data: tags } = user
    ? await supabase
        .from("tags")
        .select("id, owner_id, name, slug, description, color, icon, is_active, created_at, updated_at")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] as TagRow[] }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Tags</h2>
        <p className="mt-2 text-foreground/75">Manage tags for your content</p>
      </div>

      <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-foreground">Create Tag</h3>
        <form action={createTag} className="mt-4 grid gap-4 sm:grid-cols-2">
          <InputGroup className="sm:col-span-1" name="name" required label="Name" />
          <InputGroup
            className="sm:col-span-1"
            name="slug"
            label="Slug (optional)"
            placeholder="auto-from-name"
            description="If blank, we’ll generate one from the name."
          />
          <TextAreaGroup
            className="sm:col-span-2"
            name="description"
            label="Description (optional)"
            rows={3}
          />
          <div className="sm:col-span-1">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground/80">Color (optional)</label>
              <ColorPicker
                name="color"
                defaultValue="#16a34a"
                enablePalettes={false}
              />
            </div>
          </div>
          <InputGroup
            name="icon"
            label="Icon (optional)"
            placeholder="lucide icon name"
            descriptionType="tooltip"
            description="Stores an icon key; rendering depends on your icon map."
          />
          <div className="flex items-end gap-3 sm:col-span-2">
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

      {!tags || tags.length === 0 ? (
        <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-12 text-center">
          <p className="text-foreground/75">No tags yet.</p>
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
              {tags.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    {t.description ? (
                      <div className="mt-1 text-xs text-foreground/70">
                        {t.description.substring(0, 80)}
                        {t.description.length > 80 ? "…" : ""}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <code className="rounded border border-(--pw-border) bg-background/10 px-2 py-1 text-xs text-foreground/85">
                      {t.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    {t.is_active ? (
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
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="next" value={String(!t.is_active)} />
                        <Button
                          type="submit"
                          className="rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-background/20"
                          variant="ghost"
                        >
                          {t.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </form>
                      <form action={deleteTag}>
                        <input type="hidden" name="id" value={t.id} />
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

