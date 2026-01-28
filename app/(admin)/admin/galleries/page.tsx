import { revalidatePath } from "next/cache"
import { createClient } from "@/app/supabase/services/server"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { TextAreaGroup } from "@/app/components/Form/TextAreaGroup"
import { Checkbox } from "@/app/components/Form/Checkbox"

type GalleryRow = {
  id: string
  owner_id: string
  title: string
  description: string | null
  is_active: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

export default async function AdminGalleriesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  async function createGallery(formData: FormData) {
    "use server"
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const title = String(formData.get("title") ?? "").trim()
    const description = String(formData.get("description") ?? "").trim() || null
    const isActive = formData.get("is_active") === "on"
    const isPublic = formData.get("is_public") === "on"
    if (!title) return

    const { error } = await supabase.from("galleries").insert({
      owner_id: user.id,
      title,
      description,
      is_active: isActive,
      is_public: isPublic,
    })

    if (error) {
      console.error("Error creating gallery:", error)
      return
    }

    revalidatePath("/admin/galleries")
  }

  async function toggleActive(formData: FormData) {
    "use server"
    const id = String(formData.get("id") ?? "")
    const next = formData.get("next") === "true"
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase.from("galleries").update({ is_active: next }).eq("id", id)
    if (error) {
      console.error("Error updating gallery:", error)
      return
    }

    revalidatePath("/admin/galleries")
  }

  async function togglePublic(formData: FormData) {
    "use server"
    const id = String(formData.get("id") ?? "")
    const next = formData.get("next") === "true"
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase.from("galleries").update({ is_public: next }).eq("id", id)
    if (error) {
      console.error("Error updating gallery:", error)
      return
    }

    revalidatePath("/admin/galleries")
  }

  async function deleteGallery(formData: FormData) {
    "use server"
    const id = String(formData.get("id") ?? "")
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase.from("galleries").delete().eq("id", id)
    if (error) {
      console.error("Error deleting gallery:", error)
      return
    }

    revalidatePath("/admin/galleries")
  }

  const { data: galleries } = user
    ? await supabase
        .from("galleries")
        .select("id, owner_id, title, description, is_active, is_public, created_at, updated_at")
        .eq("owner_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(200)
    : { data: [] as GalleryRow[] }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Galleries</h2>
        <p className="mt-2 text-foreground/75">Create and manage image/video galleries.</p>
      </div>

      <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-foreground">Create Gallery</h3>
        <form action={createGallery} className="mt-4 grid gap-4 sm:grid-cols-2">
          <InputGroup className="sm:col-span-2" name="title" required label="Title" />
          <TextAreaGroup className="sm:col-span-2" name="description" label="Description (optional)" rows={3} />
          <div className="flex items-end gap-6 sm:col-span-2">
            <Checkbox name="is_active" label="Active" defaultChecked />
            <Checkbox name="is_public" label="Public" defaultChecked />
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

      {!user ? (
        <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-12 text-center">
          <p className="text-foreground/75">Please sign in to manage galleries.</p>
        </div>
      ) : !galleries || galleries.length === 0 ? (
        <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-12 text-center">
          <p className="text-foreground/75">No galleries yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-(--pw-border) bg-secondary/20">
          <table className="min-w-full divide-y divide-(--pw-border)">
            <thead className="bg-secondary/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--pw-border)">
              {galleries.map((g) => (
                <tr key={g.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-foreground">{g.title}</div>
                    {g.description ? (
                      <div className="mt-1 text-xs text-foreground/70">
                        {g.description.substring(0, 100)}
                        {g.description.length > 100 ? "…" : ""}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span
                        className={
                          g.is_active
                            ? "w-fit rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-foreground"
                            : "w-fit rounded-full border border-(--pw-border) bg-background/10 px-2.5 py-0.5 text-xs font-semibold text-foreground/80"
                        }
                      >
                        {g.is_active ? "Active" : "Inactive"}
                      </span>
                      <span
                        className={
                          g.is_public
                            ? "w-fit rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-foreground"
                            : "w-fit rounded-full border border-(--pw-border) bg-background/10 px-2.5 py-0.5 text-xs font-semibold text-foreground/80"
                        }
                      >
                        {g.is_public ? "Public" : "Private"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/70">
                    {new Date(g.updated_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <form action={toggleActive}>
                        <input type="hidden" name="id" value={g.id} />
                        <input type="hidden" name="next" value={String(!g.is_active)} />
                        <Button
                          type="submit"
                          className="rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-background/20"
                          variant="ghost"
                        >
                          {g.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </form>
                      <form action={togglePublic}>
                        <input type="hidden" name="id" value={g.id} />
                        <input type="hidden" name="next" value={String(!g.is_public)} />
                        <Button
                          type="submit"
                          className="rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-background/20"
                          variant="ghost"
                        >
                          {g.is_public ? "Make private" : "Make public"}
                        </Button>
                      </form>
                      <form action={deleteGallery}>
                        <input type="hidden" name="id" value={g.id} />
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

