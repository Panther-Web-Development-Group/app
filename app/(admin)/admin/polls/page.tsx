import { revalidatePath } from "next/cache"
import { createClient } from "@/app/supabase/services/server"
import { Button } from "@/app/components/Button"

type PollRow = {
  id: string
  author_id: string
  title: string
  slug: string
  description: string | null
  is_published: boolean
  published_at: string | null
  closes_at: string | null
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

export default async function AdminPollsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  async function createPoll(formData: FormData) {
    "use server"

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const title = String(formData.get("title") ?? "").trim()
    const slugRaw = String(formData.get("slug") ?? "").trim()
    const slug = slugify(slugRaw || title)
    const description = String(formData.get("description") ?? "").trim() || null
    const optionsRaw = String(formData.get("options") ?? "")
    const isPublished = formData.get("is_published") === "on"

    const options = optionsRaw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 50)

    if (!title || !slug || options.length < 2) return

    const { data: insertedPoll, error: pollError } = await supabase
      .from("polls")
      .insert({
        author_id: user.id,
        title,
        slug,
        description,
        is_published: isPublished,
        published_at: isPublished ? new Date().toISOString() : null,
      })
      .select("id")
      .single()

    if (pollError || !insertedPoll) {
      console.error("Error creating poll:", pollError)
      return
    }

    const { error: optionsError } = await supabase.from("poll_options").insert(
      options.map((label, idx) => ({
        poll_id: insertedPoll.id,
        label,
        order_index: idx,
      }))
    )

    if (optionsError) {
      console.error("Error creating poll options:", optionsError)
      // Best-effort rollback (poll without options isn't useful)
      await supabase.from("polls").delete().eq("id", insertedPoll.id)
      return
    }

    revalidatePath("/admin/polls")
  }

  async function togglePublish(formData: FormData) {
    "use server"

    const id = String(formData.get("id") ?? "")
    const next = formData.get("next") === "true"
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase
      .from("polls")
      .update({
        is_published: next,
        published_at: next ? new Date().toISOString() : null,
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating poll:", error)
      return
    }

    revalidatePath("/admin/polls")
  }

  async function deletePoll(formData: FormData) {
    "use server"

    const id = String(formData.get("id") ?? "")
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase.from("polls").delete().eq("id", id)

    if (error) {
      console.error("Error deleting poll:", error)
      return
    }

    revalidatePath("/admin/polls")
  }

  const { data: polls } = user
    ? await supabase
        .from("polls")
        .select("id, author_id, title, slug, description, is_published, published_at, closes_at, created_at, updated_at")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] as PollRow[] }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Polls</h2>
        <p className="mt-2 text-foreground/75">Create and manage polls</p>
      </div>

      <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-foreground">Create Poll</h3>
        <form action={createPoll} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Title</label>
            <input
              name="title"
              required
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Slug (optional)</label>
            <input
              name="slug"
              placeholder="auto-from-title"
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
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Options (one per line)</label>
            <textarea
              name="options"
              rows={4}
              placeholder={"Option 1\nOption 2\nOption 3"}
              required
              className="mt-1 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
            <p className="mt-1 text-xs text-foreground/70">Minimum 2 options.</p>
          </div>
          <div className="sm:col-span-2 flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <input type="checkbox" name="is_published" className="h-4 w-4" />
              Publish now
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

      {!polls || polls.length === 0 ? (
        <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-12 text-center">
          <p className="text-foreground/75">No polls yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-(--pw-border) bg-secondary/20">
          <table className="min-w-full divide-y divide-(--pw-border)">
            <thead className="bg-secondary/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Poll
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
              {polls.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-foreground">{p.title}</div>
                    <div className="mt-1 text-xs text-foreground/70">
                      <code className="rounded border border-(--pw-border) bg-background/10 px-2 py-0.5">
                        {p.slug}
                      </code>
                    </div>
                    {p.description ? (
                      <div className="mt-2 text-xs text-foreground/70">
                        {p.description.substring(0, 90)}
                        {p.description.length > 90 ? "…" : ""}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    {p.is_published ? (
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
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="next" value={String(!p.is_published)} />
                        <Button
                          type="submit"
                          className="rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-background/20"
                          variant="ghost"
                        >
                          {p.is_published ? "Unpublish" : "Publish"}
                        </Button>
                      </form>
                      <form action={deletePoll}>
                        <input type="hidden" name="id" value={p.id} />
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

