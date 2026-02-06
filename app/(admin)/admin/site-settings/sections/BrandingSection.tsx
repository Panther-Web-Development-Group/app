"use client"
import { useState } from "react"
import { Field } from "@/app/components/Form/Field"
import { Button } from "@/app/components/Button"
import { Checkbox } from "@/app/components/Form/Checkbox"
import { ColorPicker } from "@/app/components/Form/ColorPicker"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { TextAreaGroup } from "@/app/components/Form/TextAreaGroup"
import { SettingsSection } from "./SettingsSection"
import type { Json } from "@/lib/supabase/types"
import { ImageSelector } from "../../ImageSelector"

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

type BrandingSectionProps = {
  data: SiteBrandingRow | null
  action: (formData: FormData) => Promise<void>
}

export function BrandingSection({ data, action }: BrandingSectionProps) {
  const [headerLogo, setHeaderLogo] = useState(data?.header_logo ?? "")
  const [footerLogo, setFooterLogo] = useState(data?.footer_logo ?? "")

  return (
    <SettingsSection
      title="Site Branding"
      description="Header/footer logos, logo text, and theme color."
    >
      <form action={action} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-foreground/70">
            Header logo URL
          </label>
          <ImageSelector
            value={headerLogo}
            onValueChange={setHeaderLogo}
            placeholder="Select header logo"
            className="mt-1"
          />
          <input type="hidden" name="header_logo" value={headerLogo} />
        </div>
        <InputGroup
          name="header_logo_alt"
          defaultValue={data?.header_logo_alt ?? ""}
          label="Header logo alt (optional)"
        />
        <InputGroup
          name="header_logo_text"
          defaultValue={data?.header_logo_text ?? ""}
          label="Header logo text (editable)"
          placeholder="Site name"
        />
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-foreground/70">
            Footer logo URL
          </label>
          <ImageSelector
            value={footerLogo}
            onValueChange={setFooterLogo}
            placeholder="Select footer logo"
            className="mt-1"
          />
          <input type="hidden" name="footer_logo" value={footerLogo} />
        </div>
        <InputGroup
          name="footer_logo_alt"
          defaultValue={data?.footer_logo_alt ?? ""}
          label="Footer logo alt (optional)"
        />
        <InputGroup
          name="footer_logo_text"
          defaultValue={data?.footer_logo_text ?? ""}
          label="Footer logo text (optional)"
        />
        <Field label="Theme color" className="sm:col-span-2">
          <ColorPicker
            name="theme_color"
            defaultValue={data?.theme_color ?? ""}
          />
        </Field>
        <TextAreaGroup
          className="sm:col-span-2"
          name="metadata"
          rows={3}
          defaultValue={data?.metadata ? JSON.stringify(data.metadata) : ""}
          placeholder='{"favicon":"/favicon.ico"}'
          label="Metadata (optional JSON)"
          descriptionType="tooltip"
          description="Optional JSON blob for future site metadata."
        />
        <div className="sm:col-span-2 flex items-center gap-4">
          <Checkbox
            name="is_active"
            label="Active"
            defaultChecked={data?.is_active ?? true}
          />
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
    </SettingsSection>
  )
}
