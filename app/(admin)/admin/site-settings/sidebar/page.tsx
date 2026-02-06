import { revalidatePath } from "next/cache"
import Link from "next/link"
import { createClient } from "@/app/supabase/services/server"
import { SidebarSection } from "../sections/SidebarSection"
import { ArrowLeft } from "lucide-react"

type SiteBrandingRow = {
  id: string
  owner_id: string
  sidebar_logo_media_id: string | null
  sidebar_logo_text: string | null
  created_at: string
  updated_at: string
}

export default async function AdminSiteSettingsSidebarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  async function upsertSidebarBranding(formData: FormData) {
    "use server"

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const sidebarLogoMediaId = String(formData.get("sidebar_logo_media_id") ?? "").trim() || null
    const sidebarLogoText = String(formData.get("sidebar_logo_text") ?? "").trim() || null

    // Get existing branding to preserve other fields
    const { data: existing } = await supabase
      .from("site_branding")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle()

    const { error } = await supabase
      .from("site_branding")
      .upsert(
        {
          owner_id: user.id,
          header_logo: existing?.header_logo || null,
          header_logo_alt: existing?.header_logo_alt || null,
          header_logo_text: existing?.header_logo_text || null,
          footer_logo: existing?.footer_logo || null,
          footer_logo_alt: existing?.footer_logo_alt || null,
          footer_logo_text: existing?.footer_logo_text || null,
          sidebar_logo_media_id: sidebarLogoMediaId,
          sidebar_logo_text: sidebarLogoText,
          theme_color: existing?.theme_color || null,
          is_active: existing?.is_active ?? true,
          metadata: existing?.metadata || {},
        },
        { onConflict: "owner_id" }
      )

    if (error) {
      console.error("Error saving sidebar branding:", error)
      return
    }

    revalidatePath("/admin/site-settings")
    revalidatePath("/admin/site-settings/sidebar")
  }

  const { data: branding } = user
    ? await supabase
        .from("site_branding")
        .select("id, owner_id, sidebar_logo_media_id, sidebar_logo_text, created_at, updated_at")
        .eq("owner_id", user.id)
        .maybeSingle()
    : { data: null as SiteBrandingRow | null }

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
        <h2 className="text-3xl font-bold text-foreground">Side Branding</h2>
        <p className="mt-2 text-foreground/75">Sidebar logo and logo text.</p>
      </div>
      <SidebarSection data={branding} action={upsertSidebarBranding} />
    </div>
  )
}
