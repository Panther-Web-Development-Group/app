import { revalidatePath } from "next/cache"
import { createClient } from "@/app/supabase/services/server"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { TextAreaGroup } from "@/app/components/Form/TextAreaGroup"
import { Checkbox } from "@/app/components/Form/Checkbox"

type SlideshowRow = {
  id: string
  owner_id: string
  title: string
  description: string | null
  autoplay: boolean
  autoplay_interval_ms: number
  loop: boolean
  show_controls: boolean
  show_indicators: boolean
  is_active: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

export default async function AdminSlideshowsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  async function createSlideshow(formData: FormData) {
    "use server"
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const title = String(formData.get("title") ?? "").trim()
    const description = String(formData.get("description") ?? "").trim() || null
    const autoplay = formData.get("autoplay") === "on"
    const autoplayInterval = Number(formData.get("autoplay_interval_ms") ?? 5000) || 5000
    const loop = formData.get("loop") === "on"
    const showControls = formData.get("show_controls") === "on"
    const showIndicators = formData.get("show_indicators") === "on"
    const isActive = formData.get("is_active") === "on"
    const isPublic = formData.get("is_public") === "on"
    if (!title) return

    const { error } = await supabase.from("slideshows").insert({
      owner_id: user.id,
      title,
      description,
      autoplay,
      autoplay_interval_ms: autoplayInterval,
      loop,
      show_controls: showControls,
      show_indicators: showIndicators,
      is_active: isActive,
      is_public: isPublic,
    })

    if (error) {
      console.error("Error creating slideshow:", error)
      return
    }

    revalidatePath("/admin/slideshows")
  }

  async function toggleActive(formData: FormData) {
    "use server"
    const id = String(formData.get("id") ?? "")
    const next = formData.get("next") === "true"
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase.from("slideshows").update({ is_active: next }).eq("id", id)
    if (error) {
      console.error("Error updating slideshow:", error)
      return
    }

    revalidatePath("/admin/slideshows")
  }

  async function togglePublic(formData: FormData) {
    "use server"
    const id = String(formData.get("id") ?? "")
    const next = formData.get("next") === "true"
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase.from("slideshows").update({ is_public: next }).eq("id", id)
    if (error) {
      console.error("Error updating slideshow:", error)
      return
    }

    revalidatePath("/admin/slideshows")
  }

  async function deleteSlideshow(formData: FormData) {
    "use server"
    const id = String(formData.get("id") ?? "")
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase.from("slideshows").delete().eq("id", id)
    if (error) {
      console.error("Error deleting slideshow:", error)
      return
    }

    revalidatePath("/admin/slideshows")
  }

  const { data: slideshows } = user
    ? await supabase
        .from("slideshows")
        .select(
          "id, owner_id, title, description, autoplay, autoplay_interval_ms, loop, show_controls, show_indicators, is_active, is_public, created_at, updated_at"
        )
        .eq("owner_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(200)
    : { data: [] as SlideshowRow[] }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Slideshows</h2>
        <p className="mt-2 text-foreground/75">Create and manage slideshows backed by media assets.</p>
      </div>

      <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-foreground">Create Slideshow</h3>
        <form action={createSlideshow} className="mt-4 grid gap-4 sm:grid-cols-2">
          <InputGroup className="sm:col-span-2" name="title" required label="Title" />
          <TextAreaGroup className="sm:col-span-2" name="description" label="Description (optional)" rows={3} />
          <InputGroup
            name="autoplay_interval_ms"
            type="number"
            defaultValue={5000}
            label="Autoplay interval (ms)"
            description="Used only when autoplay is enabled."
          />
          <div className="flex items-end gap-6">
            <Checkbox name="autoplay" label="Autoplay" defaultChecked />
            <Checkbox name="loop" label="Loop" defaultChecked />
          </div>
          <div className="flex items-end gap-6 sm:col-span-2">
            <Checkbox name="show_controls" label="Show controls" defaultChecked />
            <Checkbox name="show_indicators" label="Show indicators" defaultChecked />
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
          <p className="text-foreground/75">Please sign in to manage slideshows.</p>
        </div>
      ) : !slideshows || slideshows.length === 0 ? (
        <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-12 text-center">
          <p className="text-foreground/75">No slideshows yet.</p>
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
                  Settings
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
              {slideshows.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-foreground">{s.title}</div>
                    {s.description ? (
                      <div className="mt-1 text-xs text-foreground/70">
                        {s.description.substring(0, 100)}
                        {s.description.length > 100 ? "…" : ""}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span
                        className={
                          s.is_active
                            ? "w-fit rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-foreground"
                            : "w-fit rounded-full border border-(--pw-border) bg-background/10 px-2.5 py-0.5 text-xs font-semibold text-foreground/80"
                        }
                      >
                        {s.is_active ? "Active" : "Inactive"}
                      </span>
                      <span
                        className={
                          s.is_public
                            ? "w-fit rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-foreground"
                            : "w-fit rounded-full border border-(--pw-border) bg-background/10 px-2.5 py-0.5 text-xs font-semibold text-foreground/80"
                        }
                      >
                        {s.is_public ? "Public" : "Private"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/70">
                    <div className="space-y-1">
                      <div>
                        autoplay: <span className="font-semibold">{s.autoplay ? "on" : "off"}</span>
                      </div>
                      <div>
                        interval: <span className="font-semibold">{s.autoplay_interval_ms}ms</span>
                      </div>
                      <div>
                        loop: <span className="font-semibold">{s.loop ? "on" : "off"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/70">
                    {new Date(s.updated_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <form action={toggleActive}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="next" value={String(!s.is_active)} />
                        <Button
                          type="submit"
                          className="rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-background/20"
                          variant="ghost"
                        >
                          {s.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </form>
                      <form action={togglePublic}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="next" value={String(!s.is_public)} />
                        <Button
                          type="submit"
                          className="rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-background/20"
                          variant="ghost"
                        >
                          {s.is_public ? "Make private" : "Make public"}
                        </Button>
                      </form>
                      <form action={deleteSlideshow}>
                        <input type="hidden" name="id" value={s.id} />
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

