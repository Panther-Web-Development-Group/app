"use client"

import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { SettingsSection } from "./SettingsSection"

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

type FooterSectionProps = {
  data: FooterConfigRow | null
  action: (formData: FormData) => Promise<void>
}

export function FooterSection({ data, action }: FooterSectionProps) {
  return (
    <SettingsSection
      title="Footer"
      description="Contact info and copyright."
    >
      <form action={action} className="grid gap-4 sm:grid-cols-2">
        <InputGroup
          name="contact_email"
          defaultValue={data?.contact_email ?? ""}
          label="Contact email"
          type="email"
        />
        <InputGroup
          name="contact_phone"
          defaultValue={data?.contact_phone ?? ""}
          label="Contact phone"
        />
        <InputGroup
          name="contact_website"
          defaultValue={data?.contact_website ?? ""}
          label="Contact website"
          placeholder="https://…"
          className="sm:col-span-2"
        />
        <InputGroup
          name="copyright_text"
          defaultValue={data?.copyright_text ?? ""}
          label="Copyright text"
          className="sm:col-span-2"
        />
        <div className="sm:col-span-2">
          <Button
            type="submit"
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
            variant="ghost"
          >
            Save Footer
          </Button>
        </div>
      </form>
    </SettingsSection>
  )
}
