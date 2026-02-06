import { revalidatePath } from "next/cache"
import { createClient } from "@/app/supabase/services/server"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { TextAreaGroup } from "@/app/components/Form/TextAreaGroup"
import { Checkbox } from "@/app/components/Form/Checkbox"
import { Select, SelectContent, SelectOption, SelectTrigger } from "@/app/components/Form/Select"
import type { Json } from "@/lib/supabase/types"
// import { GlobalsTabs } from "./GlobalsTabs"
import { BrandingSection } from "./sections/BrandingSection"
import { SeoSection } from "./sections/SeoSection"
import { SiteBehaviorSection } from "./sections/SiteBehaviorSection"
import { SettingsSection } from "./sections/SettingsSection"
import { Link } from "@/app/components/Link"

type SiteBrandingRow = {
  id: string
  owner_id: string
  header_logo: string | null
  header_logo_alt: string | null
  header_logo_text: string | null
  footer_logo: string | null
  footer_logo_alt: string | null
  footer_logo_text: string | null
  sidebar_logo_media_id: string | null
  sidebar_logo_text: string | null
  theme_color: string | null
  is_active: boolean
  metadata: Json
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
  structured_data: Json | null
  google_analytics_id: string | null
  facebook_pixel_id: string | null
  created_at: string
  updated_at: string
}

type MinimalPageRow = { id: string; title: string; slug: string; is_published: boolean }
type MinimalPostRow = { id: string; title: string; slug: string; is_published: boolean }

type SiteSettingRow = {
  id: string
  key: string
  value: Json
  value_type: "string" | "number" | "boolean" | "object" | "array"
  description: string | null
  category: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

function parseTypedValue(valueType: SiteSettingRow["value_type"], raw: string): Json {
  const trimmed = raw.trim()

  if (valueType === "string") return trimmed
  if (valueType === "number") return trimmed === "" ? 0 : Number(trimmed)
  if (valueType === "boolean") return trimmed === "true" || trimmed === "1" || trimmed.toLowerCase() === "yes"
  if (valueType === "object" || valueType === "array") {
    if (!trimmed) return valueType === "array" ? [] : {}
    return JSON.parse(trimmed) as Json
  }

  return trimmed
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

    // Get existing branding to preserve sidebar fields
    const { data: existing } = await supabase
      .from("site_branding")
      .select("sidebar_logo_media_id, sidebar_logo_text")
      .eq("owner_id", user.id)
      .maybeSingle()

    const headerLogo = String(formData.get("header_logo") ?? "").trim() || null
    const headerAlt = String(formData.get("header_logo_alt") ?? "").trim() || null
    const headerLogoText = String(formData.get("header_logo_text") ?? "").trim() || null
    const footerLogo = String(formData.get("footer_logo") ?? "").trim() || null
    const footerAlt = String(formData.get("footer_logo_alt") ?? "").trim() || null
    const footerLogoText = String(formData.get("footer_logo_text") ?? "").trim() || null
    const themeColor = String(formData.get("theme_color") ?? "").trim() || null
    const isActive = formData.get("is_active") === "on"
    const metadataRaw = String(formData.get("metadata") ?? "").trim()

    let metadata: Json = {}
    if (metadataRaw) {
      try {
        metadata = JSON.parse(metadataRaw) as Json
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
          header_logo_text: headerLogoText,
          footer_logo: footerLogo,
          footer_logo_alt: footerAlt,
          footer_logo_text: footerLogoText,
          sidebar_logo_media_id: existing?.sidebar_logo_media_id || null,
          sidebar_logo_text: existing?.sidebar_logo_text || null,
          theme_color: themeColor,
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
    const isGlobal = targetType === "global"
    if (!isGlobal && (!targetId || (targetType !== "page" && targetType !== "post"))) return

    const metaKeywordsRaw = formData.getAll("meta_keywords")
    const metaKeywords = Array.isArray(metaKeywordsRaw) && metaKeywordsRaw.length > 0
      ? metaKeywordsRaw.map((s) => String(s).trim()).filter(Boolean)
      : null

    const payload = {
      owner_id: user.id,
      post_id: isGlobal ? null : (targetType === "post" ? targetId : null),
      page_id: isGlobal ? null : (targetType === "page" ? targetId : null),
      meta_title: String(formData.get("meta_title") ?? "").trim() || null,
      meta_description: String(formData.get("meta_description") ?? "").trim() || null,
      meta_keywords: metaKeywords,
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
      google_analytics_id: String(formData.get("google_analytics_id") ?? "").trim() || null,
      facebook_pixel_id: String(formData.get("facebook_pixel_id") ?? "").trim() || null,
      structured_data: null as Json | null,
    }

    const structuredRaw = String(formData.get("structured_data") ?? "").trim()
    if (structuredRaw) {
      try {
        payload.structured_data = JSON.parse(structuredRaw) as Json
      } catch (e) {
        console.error("Invalid JSON-LD for structured_data:", e)
        return
      }
    }

    const existing = isGlobal
      ? await supabase.from("seo_metadata").select("id").eq("owner_id", user.id).is("post_id", null).is("page_id", null).maybeSingle()
      : targetType === "page"
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

    let value: Json
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

  async function upsertHeaderConfig(formData: FormData) {
    "use server"
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const placeholderText = String(formData.get("placeholder_text") ?? "").trim() || null
    const searchUrl = String(formData.get("search_url") ?? "").trim() || null
    const { error } = await supabase.from("header_config").upsert(
      { owner_id: user.id, placeholder_text: placeholderText, search_url: searchUrl },
      { onConflict: "owner_id" }
    )
    if (error) console.error("Error saving header config:", error)
    else revalidatePath("/admin/site-settings")
  }

  async function upsertFooterConfig(formData: FormData) {
    "use server"
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const contactEmail = String(formData.get("contact_email") ?? "").trim() || null
    const contactPhone = String(formData.get("contact_phone") ?? "").trim() || null
    const contactWebsite = String(formData.get("contact_website") ?? "").trim() || null
    const copyrightText = String(formData.get("copyright_text") ?? "").trim() || null
    const { error } = await supabase.from("footer_config").upsert(
      { owner_id: user.id, contact_email: contactEmail, contact_phone: contactPhone, contact_website: contactWebsite, copyright_text: copyrightText },
      { onConflict: "owner_id" }
    )
    if (error) console.error("Error saving footer config:", error)
    else revalidatePath("/admin/site-settings")
  }

  async function upsertHomepageConfig(formData: FormData) {
    "use server"
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const homepageTitle = String(formData.get("homepage_title") ?? "").trim() || null
    const heroType = (String(formData.get("hero_type") ?? "text") as "text" | "image" | "slideshow") || "text"
    const welcomeText = String(formData.get("welcome_text") ?? "").trim() || null
    const foundingDateRaw = String(formData.get("founding_date") ?? "").trim() || null
    const memberCountRaw = String(formData.get("member_count") ?? "").trim()
    const githubReposRaw = String(formData.get("github_repos_count") ?? "").trim()
    const upcomingLimit = parseInt(String(formData.get("upcoming_events_limit") ?? ""), 10)
    const announcementsLimit = parseInt(String(formData.get("announcements_limit") ?? ""), 10)
    const featuredLimit = parseInt(String(formData.get("featured_posts_limit") ?? ""), 10)
    let heroConfig: Json = {}
    let aboutContent: Json = {}
    let technologiesUsed: string[] = []
    let additionalSections: Json = []
    try {
      const h = String(formData.get("hero_config") ?? "{}").trim()
      if (h) heroConfig = JSON.parse(h) as Json
    } catch { /* ignore */ }
    try {
      const a = String(formData.get("about_content") ?? "{}").trim()
      if (a) aboutContent = JSON.parse(a) as Json
    } catch { /* ignore */ }
    try {
      const t = String(formData.get("technologies_used") ?? "").trim()
      if (t) technologiesUsed = t.split(",").map((s) => s.trim()).filter(Boolean)
    } catch { /* ignore */ }
    try {
      const s = String(formData.get("additional_sections") ?? "[]").trim()
      if (s) additionalSections = JSON.parse(s) as Json
    } catch { /* ignore */ }
    const { error } = await supabase.from("homepage_config").upsert(
      {
        owner_id: user.id,
        homepage_title: homepageTitle,
        hero_type: heroType,
        hero_config: heroConfig,
        welcome_text: welcomeText,
        about_content: aboutContent,
        technologies_used: technologiesUsed.length ? technologiesUsed : null,
        founding_date: foundingDateRaw || null,
        member_count: memberCountRaw === "" ? null : parseInt(memberCountRaw, 10),
        github_repos_count: githubReposRaw === "" ? null : parseInt(githubReposRaw, 10),
        upcoming_events_limit: Number.isNaN(upcomingLimit) ? null : upcomingLimit,
        announcements_limit: Number.isNaN(announcementsLimit) ? null : announcementsLimit,
        featured_posts_limit: Number.isNaN(featuredLimit) ? null : featuredLimit,
        additional_sections: additionalSections,
      },
      { onConflict: "owner_id" }
    )
    if (error) console.error("Error saving homepage config:", error)
    else revalidatePath("/admin/site-settings")
  }

  async function upsertReservedSettings(formData: FormData) {
    "use server"
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const keys = [
      { key: "timezone", value: String(formData.get("timezone") ?? "UTC").trim() || "UTC", value_type: "string" as const },
      { key: "maintenance_mode", value: formData.get("maintenance_mode") === "on", value_type: "boolean" as const },
      { key: "maintenance_message", value: String(formData.get("maintenance_message") ?? "").trim(), value_type: "string" as const },
      { key: "cookie_consent_message", value: String(formData.get("cookie_consent_message") ?? "").trim(), value_type: "string" as const },
      { key: "cookie_consent_accept_text", value: String(formData.get("cookie_consent_accept_text") ?? "Accept").trim() || "Accept", value_type: "string" as const },
      { key: "cookie_consent_decline_text", value: String(formData.get("cookie_consent_decline_text") ?? "Decline").trim() || "Decline", value_type: "string" as const },
    ]
    for (const { key, value, value_type } of keys) {
      await supabase.from("site_settings").upsert(
        { key, value, value_type, category: "general", is_public: true, updated_by: user.id },
        { onConflict: "key" }
      )
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
        .select("id, owner_id, header_logo, header_logo_alt, header_logo_text, footer_logo, footer_logo_alt, footer_logo_text, sidebar_logo_media_id, sidebar_logo_text, theme_color, is_active, metadata, created_at, updated_at")
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
            "id, owner_id, post_id, page_id, meta_title, meta_description, meta_keywords, og_title, og_description, og_image, og_type, og_url, twitter_card, twitter_title, twitter_description, twitter_image, twitter_site, twitter_creator, canonical_url, robots, structured_data, google_analytics_id, facebook_pixel_id, created_at, updated_at"
          )
          .eq("owner_id", user.id)
          .order("updated_at", { ascending: false }),
      ])
    : [{ data: [] as MinimalPageRow[] }, { data: [] as MinimalPostRow[] }, { data: [] as SeoMetadataRow[] }]

  const pageById = new Map((pages ?? []).map((p) => [p.id, p]))
  const postById = new Map((posts ?? []).map((p) => [p.id, p]))
  const globalSeo = (seo ?? []).find((r) => r.post_id === null && r.page_id === null) ?? null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Site Settings</h2>
        <p className="mt-2 text-foreground/75">Configure global site settings</p>
      </div>

      <SettingsSection title="Globals" description="Header, footer, sidebar, and homepage configuration.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/site-settings/header"
            className="flex flex-col rounded-lg border border-(--pw-border) bg-secondary/20 p-5 transition-colors hover:bg-secondary/30"
          >
            <span className="font-semibold text-foreground">Header</span>
            <span className="mt-1 text-sm text-foreground/70">Search placeholder and search URL</span>
          </Link>
          <Link
            href="/admin/site-settings/footer"
            className="flex flex-col rounded-lg border border-(--pw-border) bg-secondary/20 p-5 transition-colors hover:bg-secondary/30"
          >
            <span className="font-semibold text-foreground">Footer</span>
            <span className="mt-1 text-sm text-foreground/70">Contact info and copyright</span>
          </Link>
          <Link
            href="/admin/site-settings/sidebar"
            className="flex flex-col rounded-lg border border-(--pw-border) bg-secondary/20 p-5 transition-colors hover:bg-secondary/30"
          >
            <span className="font-semibold text-foreground">Side Branding</span>
            <span className="mt-1 text-sm text-foreground/70">Sidebar logo and logo text</span>
          </Link>
          <Link
            href="/admin/site-settings/homepage"
            className="flex flex-col rounded-lg border border-(--pw-border) bg-secondary/20 p-5 transition-colors hover:bg-secondary/30"
          >
            <span className="font-semibold text-foreground">Homepage</span>
            <span className="mt-1 text-sm text-foreground/70">Hero, about, and section limits</span>
          </Link>
        </div>
      </SettingsSection>
      <BrandingSection data={branding} action={upsertBranding} />
      <SeoSection
        pages={pages ?? []}
        posts={posts ?? []}
        seo={seo ?? []}
        globalSeo={globalSeo}
        pageById={pageById}
        postById={postById}
        onUpsert={upsertSeo}
        onDelete={deleteSeo}
      />
      <SiteBehaviorSection
        timezone={(() => {
          const byKey = new Map((settings ?? []).map((s) => [s.key, s]))
          const v = byKey.get("timezone")?.value
          return typeof v === "string" ? v : "UTC"
        })()}
        maintenanceMode={(() => {
          const v = (settings ?? []).find((s) => s.key === "maintenance_mode")?.value
          return typeof v === "boolean" ? v : false
        })()}
        maintenanceMessage={(() => {
          const v = (settings ?? []).find((s) => s.key === "maintenance_message")?.value
          return typeof v === "string" ? v : ""
        })()}
        cookieMessage={(() => {
          const v = (settings ?? []).find((s) => s.key === "cookie_consent_message")?.value
          return typeof v === "string" ? v : ""
        })()}
        cookieAccept={(() => {
          const v = (settings ?? []).find((s) => s.key === "cookie_consent_accept_text")?.value
          return typeof v === "string" ? v : "Accept"
        })()}
        cookieDecline={(() => {
          const v = (settings ?? []).find((s) => s.key === "cookie_consent_decline_text")?.value
          return typeof v === "string" ? v : "Decline"
        })()}
        action={upsertReservedSettings}
      />

      <SettingsSection title="Create / Update Setting" description="Saving an existing key will update it.">
        <p className="mt-1 text-sm text-foreground/70">
          Saving an existing key will update it.
        </p>

        <form action={upsertSetting} className="mt-4 grid gap-4 sm:grid-cols-2">
          <InputGroup
            name="key"
            required
            placeholder="site_title"
            label="Key"
          />
          <InputGroup
            name="category"
            defaultValue="general"
            placeholder="general"
            label="Category"
          />
          <div>
            <label className="text-sm font-semibold text-foreground/80">Value Type</label>
            <Select name="value_type" defaultValue="string">
              <SelectTrigger className="mt-1" />
              <SelectContent>
                <SelectOption value="string">string</SelectOption>
                <SelectOption value="number">number</SelectOption>
                <SelectOption value="boolean">boolean</SelectOption>
                <SelectOption value="object">object</SelectOption>
                <SelectOption value="array">array</SelectOption>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-3">
            <Checkbox name="is_public" label="Public" defaultChecked />
          </div>
          <TextAreaGroup
            className="sm:col-span-2"
            name="value"
            rows={4}
            placeholder='For object/array, paste valid JSON (e.g. {"theme":"dark"})'
            label="Value"
          />
          <InputGroup
            className="sm:col-span-2"
            name="description"
            label="Description (optional)"
          />

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
      </SettingsSection>

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

