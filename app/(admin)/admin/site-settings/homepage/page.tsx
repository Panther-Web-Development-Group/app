import { revalidatePath } from "next/cache"
import Link from "next/link"
import { createClient } from "@/app/supabase/services/server"
import type { Json } from "@/lib/supabase/types"
import { HomepageSection } from "../sections/HomepageSection"
import { AffiliateOrgsSection } from "../sections/AffiliateOrgsSection"
import { ArrowLeft } from "lucide-react"
import type {
  HomepageHeroType,
  HomepageHeroPayload,
  HeroTextPayload,
  HeroImagePayload,
  HeroSlideshowPayload,
  AboutContentPayload,
} from "@/lib/supabase/structures"

type HomepageConfigRow = {
  id: string
  owner_id: string
  homepage_title: string | null
  hero_type: string
  hero_config: Json
  welcome_text: string | null
  about_content: Json
  technologies_used: string[] | null
  founding_date: string | null
  member_count: number | null
  github_repos_count: number | null
  upcoming_events_limit: number | null
  announcements_limit: number | null
  featured_posts_limit: number | null
  additional_sections: Json
  created_at: string
  updated_at: string
}

type AffiliateOrgRow = {
  id: string
  owner_id: string
  name_full: string
  name_short: string | null
  logo_media_id: string | null
  description: string | null
  website_url: string | null
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

function buildHeroConfig(formData: FormData): Json {
  const heroType = (String(formData.get("hero_type") ?? "text").trim() || "text") as HomepageHeroType
  
  if (heroType === "text") {
    // Map form fields to structure (keeping backward compatibility with headline/subheadline)
    const headline = String(formData.get("hero_headline") ?? "").trim()
    const subheadline = String(formData.get("hero_subheadline") ?? "").trim()
    const buttonLabel = String(formData.get("hero_button_label") ?? "").trim()
    const buttonUrl = String(formData.get("hero_button_url") ?? "").trim()
    
    // Return in format compatible with both old (headline/subheadline) and new (title/description) structures
    return {
      // Legacy format (for backward compatibility)
      headline: headline || null,
      subheadline: subheadline || null,
      button_label: buttonLabel || null,
      button_url: buttonUrl || null,
      // New structure format
      title: headline || "",
      description: subheadline || "",
      button_label: buttonLabel || "",
      button_url: buttonUrl || "",
    } as Json
  }
  
  if (heroType === "image") {
    return {
      image_url: String(formData.get("hero_image_url") ?? "").trim() || null,
      image_media_id: String(formData.get("hero_image_media_id") ?? "").trim() || null,
      image_alt: null,
      title: null,
      description: null,
    } as Json
  }
  
  if (heroType === "slideshow") {
    const raw = String(formData.get("hero_slides") ?? "[]").trim()
    try {
      const slides = raw ? (JSON.parse(raw) as Json) : []
      return {
        slides: Array.isArray(slides) ? slides : [],
      } as Json
    } catch {
      return { slides: [] } as Json
    }
  }
  
  return {} as Json
}

function buildAboutContent(formData: FormData): AboutContentPayload {
  const payload: AboutContentPayload = {
    title: String(formData.get("about_title") ?? "").trim() || null,
    body: String(formData.get("about_body") ?? "").trim() || null,
    image_url: String(formData.get("about_image_url") ?? "").trim() || null,
    image_media_id: String(formData.get("about_image_media_id") ?? "").trim() || null,
  }
  return payload
}

export default async function AdminSiteSettingsHomepagePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  async function upsertHomepageConfig(formData: FormData) {
    "use server"
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const homepageTitle = String(formData.get("homepage_title") ?? "").trim() || null
    const heroType = (String(formData.get("hero_type") ?? "text").trim() as HomepageHeroType) || "text"
    const welcomeText = String(formData.get("welcome_text") ?? "").trim() || null
    const foundingDateRaw = String(formData.get("founding_date") ?? "").trim() || null
    const memberCountRaw = String(formData.get("member_count") ?? "").trim()
    const githubReposRaw = String(formData.get("github_repos_count") ?? "").trim()
    const upcomingLimit = parseInt(String(formData.get("upcoming_events_limit") ?? ""), 10)
    const announcementsLimit = parseInt(String(formData.get("announcements_limit") ?? ""), 10)
    const featuredLimit = parseInt(String(formData.get("featured_posts_limit") ?? ""), 10)

    const heroConfig = buildHeroConfig(formData) as Json
    const aboutContent = buildAboutContent(formData) as Json

    let technologiesUsed: string[] = []
    try {
      const t = String(formData.get("technologies_used") ?? "").trim()
      if (t) technologiesUsed = t.split(",").map((s) => s.trim()).filter(Boolean)
    } catch { /* ignore */ }

    let additionalSections: Json = []
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
    else {
      revalidatePath("/admin/site-settings")
      revalidatePath("/admin/site-settings/homepage")
    }
  }

  async function upsertAffiliateOrg(formData: FormData) {
    "use server"
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const id = String(formData.get("id") ?? "").trim() || undefined
    const nameFull = String(formData.get("name_full") ?? "").trim()
    if (!nameFull) return
    const nameShort = String(formData.get("name_short") ?? "").trim() || null
    const description = String(formData.get("description") ?? "").trim() || null
    const websiteUrl = String(formData.get("website_url") ?? "").trim() || null
    const orderIndex = parseInt(String(formData.get("order_index") ?? "0"), 10) || 0
    const isActive = formData.get("is_active") !== "off"
    const logoMediaId = String(formData.get("logo_media_id") ?? "").trim() || null
    const payload = { owner_id: user.id, name_full: nameFull, name_short: nameShort, description, website_url: websiteUrl, order_index: orderIndex, is_active: isActive, logo_media_id: logoMediaId || null }
    if (id) {
      const { error } = await supabase.from("affiliate_organizations").update(payload).eq("id", id).eq("owner_id", user.id)
      if (error) console.error("Error updating affiliate org:", error)
    } else {
      const { error } = await supabase.from("affiliate_organizations").insert(payload)
      if (error) console.error("Error inserting affiliate org:", error)
    }
    revalidatePath("/admin/site-settings")
    revalidatePath("/admin/site-settings/homepage")
  }

  async function deleteAffiliateOrg(formData: FormData) {
    "use server"
    const id = String(formData.get("id") ?? "")
    if (!id) return
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from("affiliate_organizations").delete().eq("id", id).eq("owner_id", user.id)
    if (error) console.error("Error deleting affiliate org:", error)
    else {
      revalidatePath("/admin/site-settings")
      revalidatePath("/admin/site-settings/homepage")
    }
  }

  const [{ data: homepageConfig }, { data: affiliateOrgs }] = user
    ? await Promise.all([
        supabase
          .from("homepage_config")
          .select("id, owner_id, homepage_title, hero_type, hero_config, welcome_text, about_content, technologies_used, founding_date, member_count, github_repos_count, upcoming_events_limit, announcements_limit, featured_posts_limit, additional_sections, created_at, updated_at")
          .eq("owner_id", user.id)
          .maybeSingle(),
        supabase.from("affiliate_organizations").select("id, owner_id, name_full, name_short, logo_media_id, description, website_url, order_index, is_active, created_at, updated_at").eq("owner_id", user.id).order("order_index", { ascending: true }),
      ])
    : [{ data: null as HomepageConfigRow | null }, { data: [] as AffiliateOrgRow[] }]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/site-settings"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Site Settings
        </Link>
      </div>
      <div>
        <h2 className="text-3xl font-bold text-foreground">Homepage</h2>
        <p className="mt-2 text-foreground/75">Homepage title, hero, welcome, about, analytics, and section limits.</p>
      </div>
      <HomepageSection data={homepageConfig} action={upsertHomepageConfig} />
      <AffiliateOrgsSection data={affiliateOrgs ?? []} onUpsert={upsertAffiliateOrg} onDelete={deleteAffiliateOrg} />
    </div>
  )
}
