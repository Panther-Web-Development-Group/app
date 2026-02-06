"use client"

import { Button } from "@/app/components/Button"
import { Checkbox } from "@/app/components/Form/Checkbox"
import { Field } from "@/app/components/Form/Field"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { NumberInput } from "@/app/components/Form/Number"
import { SettingsSection } from "./SettingsSection"

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

type AffiliateOrgsSectionProps = {
  data: AffiliateOrgRow[]
  onUpsert: (formData: FormData) => Promise<void>
  onDelete: (formData: FormData) => Promise<void>
}

export function AffiliateOrgsSection({ data, onUpsert, onDelete }: AffiliateOrgsSectionProps) {
  return (
    <SettingsSection
      title="Affiliate organizations"
      description="Organizations to show on homepage/footer (name, logo, description, link)."
    >
      <form action={onUpsert} className="grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="id" value="" />
        <InputGroup name="name_full" required placeholder="Full name" label="Full name" />
        <InputGroup name="name_short" placeholder="Short name" label="Short name" />
        <InputGroup
          name="logo_media_id"
          placeholder="Media asset UUID (optional)"
          label="Logo media ID"
          className="sm:col-span-2"
        />
        <InputGroup
          name="description"
          placeholder="Brief description"
          label="Description"
          className="sm:col-span-2"
        />
        <InputGroup
          name="website_url"
          placeholder="https://…"
          label="Website URL"
          className="sm:col-span-2"
        />
        <Field label="Order">
          <NumberInput name="order_index" defaultValue={0} min={0} />
        </Field>
        <div className="flex items-end">
          <Checkbox name="is_active" label="Active" defaultChecked />
        </div>
        <div className="sm:col-span-2">
          <Button
            type="submit"
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
            variant="ghost"
          >
            Add organization
          </Button>
        </div>
      </form>
      {data.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-(--pw-border) bg-secondary/20">
          <table className="min-w-full divide-y divide-(--pw-border)">
            <thead className="bg-secondary/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Website
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--pw-border)">
              {data.map((org) => (
                <tr key={org.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-foreground">{org.name_full}</div>
                    {org.name_short ? (
                      <div className="text-xs text-foreground/70">{org.name_short}</div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/80">{org.website_url ?? "—"}</td>
                  <td className="px-6 py-4 text-right">
                    <form action={onDelete} className="inline">
                      <input type="hidden" name="id" value={org.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        className="rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-background/20"
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
      ) : (
        <p className="mt-4 text-sm text-foreground/70">No affiliate organizations yet.</p>
      )}
    </SettingsSection>
  )
}
