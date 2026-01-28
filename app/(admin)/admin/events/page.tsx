import { revalidatePath } from "next/cache"
import { createClient } from "@/app/supabase/services/server"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { Checkbox } from "@/app/components/Form/Checkbox"
import { DateTimePicker } from "./DateTimePicker"

type EventRow = {
  id: string
  owner_id: string
  title: string
  slug: string
  start_time: string
  end_time: string | null
  timezone: string | null
  all_day: boolean
  is_virtual: boolean
  virtual_url: string | null
  is_published: boolean
  published_at: string | null
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

function toIsoFromDatetimeLocal(raw: string) {
  // `datetime-local` comes in as "YYYY-MM-DDTHH:mm" and is interpreted as local time by Date().
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export default async function AdminEventsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  async function createEvent(formData: FormData) {
    "use server"

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const title = String(formData.get("title") ?? "").trim()
    const slugRaw = String(formData.get("slug") ?? "").trim()
    const slug = slugify(slugRaw || title)
    const startRaw = String(formData.get("start_time") ?? "").trim()
    const endRaw = String(formData.get("end_time") ?? "").trim()
    const allDay = formData.get("all_day") === "on"
    const isVirtual = formData.get("is_virtual") === "on"
    const virtualUrl = String(formData.get("virtual_url") ?? "").trim() || null
    const isPublished = formData.get("is_published") === "on"

    const startIso = toIsoFromDatetimeLocal(startRaw)
    const endIso = endRaw ? toIsoFromDatetimeLocal(endRaw) : null

    if (!title || !slug || !startIso) return
    if (isVirtual && !virtualUrl) return

    const { error } = await supabase.from("events").insert({
      owner_id: user.id,
      title,
      slug,
      start_time: startIso,
      end_time: endIso,
      all_day: allDay,
      is_virtual: isVirtual,
      virtual_url: isVirtual ? virtualUrl : null,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    })

    if (error) {
      console.error("Error creating event:", error)
      return
    }

    revalidatePath("/admin/events")
  }

  async function togglePublish(formData: FormData) {
    "use server"

    const id = String(formData.get("id") ?? "")
    const next = formData.get("next") === "true"
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase
      .from("events")
      .update({
        is_published: next,
        published_at: next ? new Date().toISOString() : null,
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating event:", error)
      return
    }

    revalidatePath("/admin/events")
  }

  async function deleteEvent(formData: FormData) {
    "use server"

    const id = String(formData.get("id") ?? "")
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase.from("events").delete().eq("id", id)

    if (error) {
      console.error("Error deleting event:", error)
      return
    }

    revalidatePath("/admin/events")
  }

  const { data: events } = user
    ? await supabase
        .from("events")
        .select(
          "id, owner_id, title, slug, start_time, end_time, timezone, all_day, is_virtual, virtual_url, is_published, published_at, created_at, updated_at"
        )
        .eq("owner_id", user.id)
        .order("start_time", { ascending: false })
    : { data: [] as EventRow[] }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Events</h2>
        <p className="mt-2 text-foreground/75">Manage events and calendars</p>
      </div>

      <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-foreground">Create Event</h3>
        <form action={createEvent} className="mt-4 grid gap-4 sm:grid-cols-2">
          <InputGroup className="sm:col-span-2" name="title" required label="Title" />
          <InputGroup
            className="sm:col-span-2"
            name="slug"
            label="Slug (optional)"
            placeholder="auto-from-title"
            description="If blank, we’ll generate one from the title."
          />
          <DateTimePicker
            name="start_time"
            required
            label="Start"
            className="sm:col-span-1"
          />
          <DateTimePicker
            name="end_time"
            label="End (optional)"
            className="sm:col-span-1"
          />
          <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
            <Checkbox name="all_day" label="All-day" />
            <Checkbox name="is_virtual" label="Virtual" />
            <Checkbox name="is_published" label="Publish now" />
          </div>
          <div className="sm:col-span-2">
            <InputGroup
              name="virtual_url"
              label="Virtual URL (required if virtual)"
              placeholder="https://…"
            />
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

      {!events || events.length === 0 ? (
        <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-12 text-center">
          <p className="text-foreground/75">No events yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-(--pw-border) bg-secondary/20">
          <table className="min-w-full divide-y divide-(--pw-border)">
            <thead className="bg-secondary/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Start
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
              {events.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-foreground">{e.title}</div>
                    <div className="mt-1 text-xs text-foreground/70">
                      <code className="rounded border border-(--pw-border) bg-background/10 px-2 py-0.5">
                        {e.slug}
                      </code>
                      {e.is_virtual ? <span className="ml-2">Virtual</span> : null}
                      {e.all_day ? <span className="ml-2">All-day</span> : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/70">
                    {new Date(e.start_time).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {e.is_published ? (
                      <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        Published
                      </span>
                    ) : (
                      <span className="rounded-full border border-(--pw-border) bg-background/10 px-2.5 py-0.5 text-xs font-semibold text-foreground/80">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <form action={togglePublish}>
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="next" value={String(!e.is_published)} />
                        <Button
                          type="submit"
                          className="rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-background/20"
                          variant="ghost"
                        >
                          {e.is_published ? "Unpublish" : "Publish"}
                        </Button>
                      </form>
                      <form action={deleteEvent}>
                        <input type="hidden" name="id" value={e.id} />
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

