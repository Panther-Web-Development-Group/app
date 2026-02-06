"use client"

import { Button } from "@/app/components/Button"
import { Field } from "@/app/components/Form/Field"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { SettingsSection } from "./SettingsSection"

type HeaderConfigRow = {
  id: string
  owner_id: string
  placeholder_text: string | null
  search_url: string | null
  created_at: string
  updated_at: string
}

type HeaderSectionProps = {
  data: HeaderConfigRow | null
  action: (formData: FormData) => Promise<void>
}

export function HeaderSection({ data, action }: HeaderSectionProps) {
  return (
    <SettingsSection
      title="Header"
      description="Search placeholder and search URL."
    >
      <form action={action} className="grid gap-4 sm:grid-cols-2">
        <InputGroup
          name="placeholder_text"
          defaultValue={data?.placeholder_text ?? ""}
          label="Placeholder text"
          placeholder="Search…"
        />
        <InputGroup
          name="search_url"
          defaultValue={data?.search_url ?? ""}
          label="Search URL"
          placeholder="/search"
        />
        <div className="sm:col-span-2">
          <Button
            type="submit"
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
            variant="ghost"
          >
            Save Header
          </Button>
        </div>
      </form>
    </SettingsSection>
  )
}
