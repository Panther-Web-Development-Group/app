import { revalidatePath } from "next/cache"
import { createClient } from "@/app/supabase/services/server"
import { Button } from "@/app/components/Button"

type CommentRow = {
  id: string
  post_id: string | null
  page_id: string | null
  parent_comment_id: string | null
  author_id: string
  body: string
  is_approved: boolean
  created_at: string
  updated_at: string
}

export default async function AdminCommentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  async function toggleApproved(formData: FormData) {
    "use server"

    const id = String(formData.get("id") ?? "")
    const next = formData.get("next") === "true"
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase.from("comments").update({ is_approved: next }).eq("id", id)

    if (error) {
      console.error("Error updating comment:", error)
      return
    }

    revalidatePath("/admin/comments")
  }

  async function deleteComment(formData: FormData) {
    "use server"

    const id = String(formData.get("id") ?? "")
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase.from("comments").delete().eq("id", id)

    if (error) {
      console.error("Error deleting comment:", error)
      return
    }

    revalidatePath("/admin/comments")
  }

  const { data: comments } = user
    ? await supabase
        .from("comments")
        .select("id, post_id, page_id, parent_comment_id, author_id, body, is_approved, created_at, updated_at")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] as CommentRow[] }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Comments</h2>
        <p className="mt-2 text-foreground/75">
          Manage comments you’ve authored (moderation for other users requires additional RLS/roles).
        </p>
      </div>

      {!comments || comments.length === 0 ? (
        <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-12 text-center">
          <p className="text-foreground/75">No comments found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-(--pw-border) bg-secondary/20">
          <table className="min-w-full divide-y divide-(--pw-border)">
            <thead className="bg-secondary/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Comment
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Target
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
              {comments.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">{c.body}</div>
                    <div className="mt-2 text-xs text-foreground/70">
                      {new Date(c.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/70">
                    {c.post_id ? (
                      <code className="rounded border border-(--pw-border) bg-background/10 px-2 py-1 text-xs">
                        post:{c.post_id}
                      </code>
                    ) : c.page_id ? (
                      <code className="rounded border border-(--pw-border) bg-background/10 px-2 py-1 text-xs">
                        page:{c.page_id}
                      </code>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {c.is_approved ? (
                      <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        Approved
                      </span>
                    ) : (
                      <span className="rounded-full border border-(--pw-border) bg-background/10 px-2.5 py-0.5 text-xs font-semibold text-foreground/80">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <form action={toggleApproved}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="next" value={String(!c.is_approved)} />
                        <Button
                          type="submit"
                          className="rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-background/20"
                          variant="ghost"
                        >
                          {c.is_approved ? "Unapprove" : "Approve"}
                        </Button>
                      </form>
                      <form action={deleteComment}>
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

