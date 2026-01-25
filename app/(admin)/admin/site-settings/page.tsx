import { revalidatePath } from "next/cache"
import { createClient } from "@/app/supabase/services/server"
import { Button } from "@/app/components/Button"

type SiteBrandingRow = {
  id: string
  owner_id: string
  header_logo: string | null
  header_logo_alt: string | null
  footer_logo: string | null
  footer_logo_alt: string | null
  is_active: boolean
  metadata: unknown
  created_at: string
  updated_at: string
}

type SeoMetadataRow = {
  id: string
  owner_id: string
  post_id: string | null
  page_id: string | null
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string[] | null
  og_title: string | null
  og_description: string | null
  og_image: string | null
  og_type: string | null
  og_url: string | null
  twitter_card: string | null
  twitter_title: string | null
  twitter_description: string | null
  twitter_image: string | null
  twitter_site: string | null
  twitter_creator: string | null
  canonical_url: string | null
  robots: string | null
  structured_data: unknown | null
  created_at: string
  updated_at: string
}

type MinimalPageRow = { id: string; title: string; slug: string; is_published: boolean }
type MinimalPostRow = { id: string; title: string; slug: string; is_published: boolean }

type SiteSettingRow = {
  id: string
  key: string
  value: unknown
  value_type: "string" | "number" | "boolean" | "object" | "array"
  description: string | null
  category: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

function parseTypedValue(valueType: SiteSettingRow["value_type"], raw: string): unknown {
  const trimmed = raw.trim()

  if (valueType === "string") return trimmed
  if (valueType === "number") return trimmed === "" ? 0 : Number(trimmed)
  if (valueType === "boolean") return trimmed === "true" || trimmed === "1" || trimmed.toLowerCase() === "yes"
  if (valueType === "object" || valueType === "array") {
    if (!trimmed) return valueType === "array" ? [] : {}
    return JSON.parse(trimmed)
  }

  return trimmed
}

function parseKeywords(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const parts = trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.length ? parts : null
}

export default async function AdminSiteSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  async function upsertBranding(formData: FormData) {
    "use server"

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const headerLogo = String(formData.get("header_logo") ?? "").trim() || null
    const headerAlt = String(formData.get("header_logo_alt") ?? "").trim() || null
    const footerLogo = String(formData.get("footer_logo") ?? "").trim() || null
    const footerAlt = String(formData.get("footer_logo_alt") ?? "").trim() || null
    const isActive = formData.get("is_active") === "on"
    const metadataRaw = String(formData.get("metadata") ?? "").trim()

    let metadata: unknown = {}
    if (metadataRaw) {
      try {
        metadata = JSON.parse(metadataRaw)
      } catch (e) {
        console.error("Invalid JSON for branding metadata:", e)
        return
      }
    }

    const { error } = await supabase
      .from("site_branding")
      .upsert(
        {
          owner_id: user.id,
          header_logo: headerLogo,
          header_logo_alt: headerAlt,
          footer_logo: footerLogo,
          footer_logo_alt: footerAlt,
          is_active: isActive,
          metadata,
        },
        { onConflict: "owner_id" }
      )

    if (error) {
      console.error("Error saving site branding:", error)
      return
    }

    revalidatePath("/admin/site-settings")
  }

  async function upsertSeo(formData: FormData) {
    "use server"

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const targetType = String(formData.get("target_type") ?? "")
    const targetId = String(formData.get("target_id") ?? "").trim()
    if (!targetId || (targetType !== "page" && targetType !== "post")) return

    const payload = {
      owner_id: user.id,
      post_id: targetType === "post" ? targetId : null,
      page_id: targetType === "page" ? targetId : null,
      meta_title: String(formData.get("meta_title") ?? "").trim() || null,
      meta_description: String(formData.get("meta_description") ?? "").trim() || null,
      meta_keywords: parseKeywords(String(formData.get("meta_keywords") ?? "")),
      og_title: String(formData.get("og_title") ?? "").trim() || null,
      og_description: String(formData.get("og_description") ?? "").trim() || null,
      og_image: String(formData.get("og_image") ?? "").trim() || null,
      og_type: String(formData.get("og_type") ?? "").trim() || null,
      og_url: String(formData.get("og_url") ?? "").trim() || null,
      twitter_card: String(formData.get("twitter_card") ?? "").trim() || null,
      twitter_title: String(formData.get("twitter_title") ?? "").trim() || null,
      twitter_description: String(formData.get("twitter_description") ?? "").trim() || null,
      twitter_image: String(formData.get("twitter_image") ?? "").trim() || null,
      twitter_site: String(formData.get("twitter_site") ?? "").trim() || null,
      twitter_creator: String(formData.get("twitter_creator") ?? "").trim() || null,
      canonical_url: String(formData.get("canonical_url") ?? "").trim() || null,
      robots: String(formData.get("robots") ?? "").trim() || null,
      structured_data: null as unknown,
    }

    const structuredRaw = String(formData.get("structured_data") ?? "").trim()
    if (structuredRaw) {
      try {
        payload.structured_data = JSON.parse(structuredRaw)
      } catch (e) {
        console.error("Invalid JSON-LD for structured_data:", e)
        return
      }
    }

    const existing =
      targetType === "page"
        ? await supabase.from("seo_metadata").select("id").eq("page_id", targetId).maybeSingle()
        : await supabase.from("seo_metadata").select("id").eq("post_id", targetId).maybeSingle()

    if (existing.error) {
      console.error("Error checking existing SEO metadata:", existing.error)
      return
    }

    const existingId = existing.data?.id as string | undefined

    const write = existingId
      ? await supabase.from("seo_metadata").update(payload).eq("id", existingId)
      : await supabase.from("seo_metadata").insert(payload)

    if (write.error) {
      console.error("Error saving SEO metadata:", write.error)
      return
    }

    revalidatePath("/admin/site-settings")
  }

  async function deleteSeo(formData: FormData) {
    "use server"

    const id = String(formData.get("id") ?? "")
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase.from("seo_metadata").delete().eq("id", id)
    if (error) {
      console.error("Error deleting SEO metadata:", error)
      return
    }

    revalidatePath("/admin/site-settings")
  }

  async function upsertSetting(formData: FormData) {
    "use server"

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const key = String(formData.get("key") ?? "").trim()
    const valueType = String(formData.get("value_type") ?? "string") as SiteSettingRow["value_type"]
    const valueRaw = String(formData.get("value") ?? "")
    const description = String(formData.get("description") ?? "").trim() || null
    const category = String(formData.get("category") ?? "").trim() || "general"
    const isPublic = formData.get("is_public") === "on"

    if (!key) return

    let value: unknown
    try {
      value = parseTypedValue(valueType, valueRaw)
    } catch (e) {
      console.error("Invalid JSON for site setting value:", e)
      return
    }

    const { error } = await supabase
      .from("site_settings")
      .upsert(
        {
          key,
          value,
          value_type: valueType,
          description,
          category,
          is_public: isPublic,
          updated_by: user.id,
        },
        { onConflict: "key" }
      )

    if (error) {
      console.error("Error saving site setting:", error)
      return
    }

    revalidatePath("/admin/site-settings")
  }

  async function deleteSetting(formData: FormData) {
    "use server"

    const id = String(formData.get("id") ?? "")
    if (!id) return

    const supabase = await createClient()
    const { error } = await supabase.from("site_settings").delete().eq("id", id)

    if (error) {
      console.error("Error deleting site setting:", error)
      return
    }

    revalidatePath("/admin/site-settings")
  }

  const { data: settings } = user
    ? await supabase
        .from("site_settings")
        .select("id, key, value, value_type, description, category, is_public, created_at, updated_at")
        .order("category", { ascending: true })
        .order("key", { ascending: true })
    : { data: [] as SiteSettingRow[] }

  const { data: branding } = user
    ? await supabase
        .from("site_branding")
        .select("id, owner_id, header_logo, header_logo_alt, footer_logo, footer_logo_alt, is_active, metadata, created_at, updated_at")
        .eq("owner_id", user.id)
        .maybeSingle()
    : { data: null as SiteBrandingRow | null }

  const [{ data: pages }, { data: posts }, { data: seo }] = user
    ? await Promise.all([
        supabase.from("pages").select("id, title, slug, is_published").eq("author_id", user.id).order("updated_at", { ascending: false }),
        supabase.from("posts").select("id, title, slug, is_published").eq("author_id", user.id).order("updated_at", { ascending: false }),
        supabase
          .from("seo_metadata")
          .select(
            "id, owner_id, post_id, page_id, meta_title, meta_description, meta_keywords, og_title, og_description, og_image, og_type, og_url, twitter_card, twitter_title, twitter_description, twitter_image, twitter_site, twitter_creator, canonical_url, robots, structured_data, created_at, updated_at"
          )
          .eq("owner_id", user.id)
          .order("updated_at", { ascending: false }),
      ])
    : [{ data: [] as MinimalPageRow[] }, { data: [] as MinimalPostRow[] }, { data: [] as SeoMetadataRow[] }]

  const pageById = new Map((pages ?? []).map((p) => [p.id, p]))
  const postById = new Map((posts ?? []).map((p) => [p.id, p]))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Site Settings</h2>
        <p className="mt-2 text-foreground/75">Configure global site settings</p>
      </div>

      <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-foreground">Site Branding</h3>
        <p className="mt-1 text-sm text-foreground/70">Header/footer logos and branding metadata.</p>

        <form action={upsertBranding} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Header logo URL</label>
            <input
              name="header_logo"
              defaultValue={branding?.header_logo ?? ""}
              placeholder="https://… or /storage/path"
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Header logo alt (optional)</label>
            <input
              name="header_logo_alt"
              defaultValue={branding?.header_logo_alt ?? ""}
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Footer logo URL</label>
            <input
              name="footer_logo"
              defaultValue={branding?.footer_logo ?? ""}
              placeholder="https://… or /storage/path"
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Footer logo alt (optional)</label>
            <input
              name="footer_logo_alt"
              defaultValue={branding?.footer_logo_alt ?? ""}
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Metadata (optional JSON)</label>
            <textarea
              name="metadata"
              rows={3}
              defaultValue={branding?.metadata ? JSON.stringify(branding.metadata) : ""}
              placeholder='{"favicon":"/favicon.ico"}'
              className="mt-1 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <input type="checkbox" name="is_active" defaultChecked={branding?.is_active ?? true} className="h-4 w-4" />
              Active
            </label>
          </div>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
              variant="ghost"
            >
              Save Branding
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-foreground">SEO Metadata</h3>
        <p className="mt-1 text-sm text-foreground/70">Attach SEO metadata to a page or post.</p>

        <form action={upsertSeo} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-foreground/80">Target type</label>
            <select
              name="target_type"
              defaultValue="page"
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="page">Page</option>
              <option value="post">Post</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground/80">Target</label>
            <select
              name="target_id"
              required
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="" disabled>
                Select…
              </option>
              <optgroup label="Pages">
                {(pages ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.slug}){p.is_published ? "" : " [draft]"}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Posts">
                {(posts ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.slug}){p.is_published ? "" : " [draft]"}
                  </option>
                ))}
              </optgroup>
            </select>
            <p className="mt-1 text-xs text-foreground/70">
              Note: pick the target type to match the item you choose.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Meta title</label>
            <input
              name="meta_title"
              placeholder="(max ~60 chars)"
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Meta description</label>
            <textarea
              name="meta_description"
              rows={3}
              placeholder="(max ~160 chars)"
              className="mt-1 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Keywords (comma-separated)</label>
            <input
              name="meta_keywords"
              placeholder="news, pantherweb, updates"
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground/80">OG type</label>
            <input
              name="og_type"
              placeholder="website"
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground/80">Twitter card</label>
            <select
              name="twitter_card"
              defaultValue="summary_large_image"
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="summary">summary</option>
              <option value="summary_large_image">summary_large_image</option>
              <option value="app">app</option>
              <option value="player">player</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">OG image URL</label>
            <input
              name="og_image"
              placeholder="https://…"
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Twitter image URL</label>
            <input
              name="twitter_image"
              placeholder="https://…"
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Canonical URL</label>
            <input
              name="canonical_url"
              placeholder="https://example.com/path"
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Robots</label>
            <input
              name="robots"
              placeholder="index,follow"
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Structured data (JSON-LD)</label>
            <textarea
              name="structured_data"
              rows={4}
              placeholder='{"@context":"https://schema.org","@type":"WebSite","name":"…"}'
              className="mt-1 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
              variant="ghost"
            >
              Save SEO Metadata
            </Button>
          </div>
        </form>

        {!seo || seo.length === 0 ? (
          <div className="mt-6 rounded-lg border border-(--pw-border) bg-background/5 p-6">
            <p className="text-foreground/75">No SEO metadata entries yet.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-lg border border-(--pw-border) bg-secondary/20">
            <table className="min-w-full divide-y divide-(--pw-border)">
              <thead className="bg-secondary/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                    Meta title
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
                {(seo ?? []).map((row) => {
                  const target =
                    row.page_id && pageById.get(row.page_id)
                      ? `Page: ${pageById.get(row.page_id)!.title}`
                      : row.post_id && postById.get(row.post_id)
                        ? `Post: ${postById.get(row.post_id)!.title}`
                        : row.page_id
                          ? `Page: ${row.page_id}`
                          : row.post_id
                            ? `Post: ${row.post_id}`
                            : "—"

                  return (
                    <tr key={row.id} className="transition-colors hover:bg-secondary/30">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-foreground">{target}</div>
                        <div className="mt-1 text-xs text-foreground/70">
                          {row.page_id ? "page" : "post"} •{" "}
                          <code className="rounded border border-(--pw-border) bg-background/10 px-2 py-0.5">
                            {row.page_id ?? row.post_id}
                          </code>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground/80">{row.meta_title ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-foreground/70">
                        {new Date(row.updated_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <form action={deleteSeo}>
                          <input type="hidden" name="id" value={row.id} />
                          <Button
                            type="submit"
                            className="rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-background/20"
                            variant="ghost"
                          >
                            Delete
                          </Button>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-foreground">Create / Update Setting</h3>
        <p className="mt-1 text-sm text-foreground/70">
          Saving an existing key will update it.
        </p>

        <form action={upsertSetting} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-foreground/80">Key</label>
            <input
              name="key"
              required
              placeholder="site_title"
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground/80">Category</label>
            <input
              name="category"
              defaultValue="general"
              placeholder="general"
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground/80">Value Type</label>
            <select
              name="value_type"
              defaultValue="string"
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
              <option value="object">object</option>
              <option value="array">array</option>
            </select>
          </div>
          <div className="flex items-end gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <input type="checkbox" name="is_public" defaultChecked className="h-4 w-4" />
              Public
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Value</label>
            <textarea
              name="value"
              rows={4}
              placeholder='For object/array, paste valid JSON (e.g. {"theme":"dark"})'
              className="mt-1 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground/80">Description (optional)</label>
            <input
              name="description"
              className="mt-1 h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
              variant="ghost"
            >
              Save
            </Button>
          </div>
        </form>
      </div>

      {!settings || settings.length === 0 ? (
        <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-12 text-center">
          <p className="text-foreground/75">No settings found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-(--pw-border) bg-secondary/20">
          <table className="min-w-full divide-y divide-(--pw-border)">
            <thead className="bg-secondary/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Public
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--pw-border)">
              {settings.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-foreground">{s.key}</div>
                    {s.description ? (
                      <div className="mt-1 text-xs text-foreground/70">
                        {s.description.substring(0, 80)}
                        {s.description.length > 80 ? "…" : ""}
                      </div>
                    ) : null}
                    <div className="mt-2 text-xs text-foreground/70">
                      <span className="font-semibold">Value:</span>{" "}
                      <code className="break-all rounded border border-(--pw-border) bg-background/10 px-2 py-1">
                        {JSON.stringify(s.value)}
                      </code>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/70">{s.category ?? "general"}</td>
                  <td className="px-6 py-4 text-sm text-foreground/70">{s.value_type}</td>
                  <td className="px-6 py-4">
                    {s.is_public ? (
                      <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        Yes
                      </span>
                    ) : (
                      <span className="rounded-full border border-(--pw-border) bg-background/10 px-2.5 py-0.5 text-xs font-semibold text-foreground/80">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <form action={deleteSetting}>
                      <input type="hidden" name="id" value={s.id} />
                      <Button
                        type="submit"
                        className="rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-background/20"
                        variant="ghost"
                      >
                        Delete
                      </Button>
                    </form>
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

