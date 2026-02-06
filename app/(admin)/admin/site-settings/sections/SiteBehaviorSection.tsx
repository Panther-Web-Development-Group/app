"use client"

import { Button } from "@/app/components/Button"
import { Field } from "@/app/components/Form/Field"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { Combobox } from "@/app/components/Form/Combobox"
import { Switch } from "@/app/components/Form/Switch"
import { TextAreaGroup } from "@/app/components/Form/TextAreaGroup"
import { TIMEZONES } from "@/lib/constants/timezones"
import { SettingsSection } from "./SettingsSection"

type SiteBehaviorSectionProps = {
  timezone: string
  maintenanceMode: boolean
  maintenanceMessage: string
  cookieMessage: string
  cookieAccept: string
  cookieDecline: string
  action: (formData: FormData) => Promise<void>
}

export function SiteBehaviorSection({
  timezone,
  maintenanceMode,
  maintenanceMessage,
  cookieMessage,
  cookieAccept,
  cookieDecline,
  action,
}: SiteBehaviorSectionProps) {
  return (
    <SettingsSection
      title="Site behavior"
      description="Timezone, maintenance mode, and cookie consent."
    >
      <form action={action} className="grid gap-4 sm:grid-cols-2">
        <Field label="Timezone">
          <Combobox 
            name="timezone" 
            defaultValue={timezone || "UTC"} 
            className="mt-1"
          >
            <Combobox.Input placeholder="Search timezones…" />
            <Combobox.Content>
              {TIMEZONES.map((tz) => (
                <Combobox.Option key={tz} value={tz} textValue={tz}>
                  {tz}
                </Combobox.Option>
              ))}
            </Combobox.Content>
          </Combobox>
        </Field>
        <Field label="Maintenance mode">
          <Switch
            name="maintenance_mode"
            defaultChecked={maintenanceMode}
            label="Maintenance mode"
          />
        </Field>
        <TextAreaGroup
          className="sm:col-span-2"
          name="maintenance_message"
          rows={2}
          defaultValue={maintenanceMessage}
          label="Maintenance message"
        />
        <TextAreaGroup
          className="sm:col-span-2"
          name="cookie_consent_message"
          rows={2}
          defaultValue={cookieMessage}
          label="Cookie consent message"
        />
        <InputGroup
          name="cookie_consent_accept_text"
          defaultValue={cookieAccept}
          label="Accept button text"
        />
        <InputGroup
          name="cookie_consent_decline_text"
          defaultValue={cookieDecline}
          label="Decline button text"
        />
        <div className="sm:col-span-2">
          <Button
            type="submit"
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
            variant="ghost"
          >
            Save site behavior
          </Button>
        </div>
      </form>
    </SettingsSection>
  )
}
