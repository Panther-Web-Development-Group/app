"use client"
import { Field } from "@/app/components/Form/Field"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { SettingsSection } from "./SettingsSection"

type SiteBrandingRow = {
  id: string
  owner_id: string
  sidebar_logo_media_id: string | null
  sidebar_logo_text: string | null
  created_at: string
  updated_at: string
}

type SidebarSectionProps = {
  data: SiteBrandingRow | null
  action: (formData: FormData) => Promise<void>
}

export function SidebarSection({ data, action }: SidebarSectionProps) {
  return (
    <SettingsSection
      title="Side Branding"
      description="Sidebar logo and logo text."
    >
      <form action={action} className="grid gap-4 sm:grid-cols-2">
        <InputGroup
          className="sm:col-span-2"
          name="sidebar_logo_media_id"
          defaultValue={data?.sidebar_logo_media_id ?? ""}
          placeholder="Media asset UUID (optional)"
          label="Sidebar logo media ID"
        />
        <InputGroup
          className="sm:col-span-2"
          name="sidebar_logo_text"
          defaultValue={data?.sidebar_logo_text ?? ""}
          label="Sidebar logo text (optional)"
          placeholder="Site name"
        />
        <div className="sm:col-span-2">
          <Button
            type="submit"
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
            variant="ghost"
          >
            Save Side Branding
          </Button>
        </div>
      </form>
    </SettingsSection>
  )
}
