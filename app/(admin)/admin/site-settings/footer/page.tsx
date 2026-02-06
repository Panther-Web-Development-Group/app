import { revalidatePath } from "next/cache"
import Link from "next/link"
import { createClient } from "@/app/supabase/services/server"
import { FooterSection } from "../sections/FooterSection"
import { ArrowLeft } from "lucide-react"

type FooterConfigRow = {
  id: string
  owner_id: string
  contact_email: string | null
  contact_phone: string | null
  contact_website: string | null
  copyright_text: string | null
  created_at: string
  updated_at: string
}

export default async function AdminSiteSettingsFooterPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
    else {
      revalidatePath("/admin/site-settings")
      revalidatePath("/admin/site-settings/footer")
    }
  }

  const { data: footerConfig } = user
    ? await supabase
        .from("footer_config")
        .select("id, owner_id, contact_email, contact_phone, contact_website, copyright_text, created_at, updated_at")
        .eq("owner_id", user.id)
        .maybeSingle()
    : { data: null as FooterConfigRow | null }

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
        <h2 className="text-3xl font-bold text-foreground">Footer</h2>
        <p className="mt-2 text-foreground/75">Contact info and copyright.</p>
      </div>
      <FooterSection data={footerConfig} action={upsertFooterConfig} />
    </div>
  )
}
