import { revalidatePath } from "next/cache"
import Link from "next/link"
import { createClient } from "@/app/supabase/services/server"
import { HeaderSection } from "../sections/HeaderSection"
import { ArrowLeft } from "lucide-react"

type HeaderConfigRow = {
  id: string
  owner_id: string
  placeholder_text: string | null
  search_url: string | null
  created_at: string
  updated_at: string
}

export default async function AdminSiteSettingsHeaderPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
    else {
      revalidatePath("/admin/site-settings")
      revalidatePath("/admin/site-settings/header")
    }
  }

  const { data: headerConfig } = user
    ? await supabase
        .from("header_config")
        .select("id, owner_id, placeholder_text, search_url, created_at, updated_at")
        .eq("owner_id", user.id)
        .maybeSingle()
    : { data: null as HeaderConfigRow | null }

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
        <h2 className="text-3xl font-bold text-foreground">Header</h2>
        <p className="mt-2 text-foreground/75">Search placeholder and search URL.</p>
      </div>
      <HeaderSection data={headerConfig} action={upsertHeaderConfig} />
    </div>
  )
}
