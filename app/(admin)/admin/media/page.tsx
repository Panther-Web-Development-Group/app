import { revalidatePath } from "next/cache"
import Link from "next/link"
import { createClient } from "@/app/supabase/services/server"
import { Button } from "@/app/components/Button"
import { MediaUploadForm } from "./MediaUploadForm"
import { FileRenameInput } from "../files/FileRenameInput"
import { MediaPreview } from "./MediaPreview"

type MediaAssetRow = {
  id: string
  owner_id: string
  filename: string
  file_url: string
  mime_type: string
  file_size: number
  asset_type: "image" | "video" | "audio" | "document" | "other"
  is_active: boolean
  is_public: boolean
  created_at: string
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—"
  const units = ["B", "KB", "MB", "GB", "TB"]
  let idx = 0
  let value = bytes
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024
    idx++
  }
  return `${value.toFixed(value >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`
}

export default async function AdminMediaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  async function toggleActive(formData: FormData) {
    "use server"
    const id = String(formData.get("id") ?? "")
    const next = formData.get("next") === "true"
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase.from("media_assets").update({ is_active: next }).eq("id", id)
    if (error) {
      console.error("Error updating media asset:", error)
      return
    }

    revalidatePath("/admin/media")
  }

  async function togglePublic(formData: FormData) {
    "use server"
    const id = String(formData.get("id") ?? "")
    const next = formData.get("next") === "true"
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase.from("media_assets").update({ is_public: next }).eq("id", id)
    if (error) {
      console.error("Error updating media asset:", error)
      return
    }

    revalidatePath("/admin/media")
  }

  async function deleteAsset(formData: FormData) {
    "use server"
    const id = String(formData.get("id") ?? "")
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase.from("media_assets").delete().eq("id", id)
    if (error) {
      console.error("Error deleting media asset:", error)
      return
    }

    revalidatePath("/admin/media")
  }

  async function renameAsset(formData: FormData) {
    "use server"
    const id = String(formData.get("id") ?? "")
    const newFilename = String(formData.get("filename") ?? "").trim()
    if (!id || !newFilename) return

    const supabase = await createClient()
    const { error } = await supabase.from("media_assets").update({ filename: newFilename }).eq("id", id)
    if (error) {
      console.error("Error renaming media asset:", error)
      return
    }

    revalidatePath("/admin/media")
  }

  const { data: assets } = user
    ? await supabase
        .from("media_assets")
        .select("id, owner_id, filename, file_url, mime_type, file_size, asset_type, is_active, is_public, created_at")
        .eq("owner_id", user.id)
        .in("asset_type", ["image", "video", "audio"])
        .order("created_at", { ascending: false })
        .limit(200)
    : { data: [] as MediaAssetRow[] }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Media</h2>
        <p className="mt-2 text-foreground/75">
          Manage image/video/audio assets. (Uploads aren’t wired up yet — this page manages existing records.)
        </p>
      </div>

      {user && <MediaUploadForm />}

      {!user ? (
        <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-12 text-center">
          <p className="text-foreground/75">Please sign in to manage media.</p>
        </div>
      ) : !assets || assets.length === 0 ? (
        <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-12 text-center">
          <p className="text-foreground/75">No media assets yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-(--pw-border) bg-secondary/20">
          <table className="min-w-full divide-y divide-(--pw-border)">
            <thead className="bg-secondary/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Visibility
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--pw-border)">
              {assets.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-6 py-4">
                    <MediaPreview
                      fileUrl={a.file_url}
                      filename={a.filename}
                      assetType={a.asset_type}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <FileRenameInput
                      id={a.id}
                      currentFilename={a.filename}
                      renameAction={renameAsset}
                    />
                    <div className="mt-1 text-xs text-foreground/70">
                      {formatBytes(a.file_size)} • {a.mime_type}
                    </div>
                    <div className="mt-2">
                      <Link
                        href={a.file_url}
                        target="_blank"
                        className="text-xs font-semibold text-foreground/80 underline hover:text-foreground"
                      >
                        Open URL
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/70">{a.asset_type}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span
                        className={
                          a.is_active
                            ? "w-fit rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-foreground"
                            : "w-fit rounded-full border border-(--pw-border) bg-background/10 px-2.5 py-0.5 text-xs font-semibold text-foreground/80"
                        }
                      >
                        {a.is_active ? "Active" : "Inactive"}
                      </span>
                      <span
                        className={
                          a.is_public
                            ? "w-fit rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-foreground"
                            : "w-fit rounded-full border border-(--pw-border) bg-background/10 px-2.5 py-0.5 text-xs font-semibold text-foreground/80"
                        }
                      >
                        {a.is_public ? "Public" : "Private"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <form action={toggleActive}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="next" value={String(!a.is_active)} />
                        <Button
                          type="submit"
                          className="rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-background/20"
                          variant="ghost"
                        >
                          {a.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </form>
                      <form action={togglePublic}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="next" value={String(!a.is_public)} />
                        <Button
                          type="submit"
                          className="rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-background/20"
                          variant="ghost"
                        >
                          {a.is_public ? "Make private" : "Make public"}
                        </Button>
                      </form>
                      <form action={deleteAsset}>
                        <input type="hidden" name="id" value={a.id} />
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

