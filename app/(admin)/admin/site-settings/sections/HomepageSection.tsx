"use client"

import { useCallback, useState } from "react"
import { Button } from "@/app/components/Button"
import { Field } from "@/app/components/Form/Field"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { NumberInput } from "@/app/components/Form/Number"
import { Select, SelectContent, SelectOption, SelectTrigger } from "@/app/components/Form/Select"
import { TextAreaGroup } from "@/app/components/Form/TextAreaGroup"
import { SettingsSection } from "./SettingsSection"
import type { Json } from "@/lib/supabase/types"
import { Plus, Trash2 } from "lucide-react"
import { ImageSelector } from "../../ImageSelector"

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

type HomepageSectionProps = {
  data: HomepageConfigRow | null
  action: (formData: FormData) => Promise<void>
}

type HeroConfigText = { headline?: string | null; subheadline?: string | null; button_label?: string | null; button_url?: string | null }
type HeroConfigImage = { image_url?: string | null; image_media_id?: string | null }
type AboutContent = { title?: string | null; body?: string | null; image_url?: string | null }
type AdditionalSection = { type: string; [key: string]: unknown }

function parseHeroConfig(hero_type: string, hero_config: Json): HeroConfigText & HeroConfigImage {
  if (!hero_config || typeof hero_config !== "object") return {}
  const o = hero_config as Record<string, unknown>
  if (hero_type === "text")
    return {
      headline: (o.headline as string) ?? "",
      subheadline: (o.subheadline as string) ?? "",
      button_label: (o.button_label as string) ?? "",
      button_url: (o.button_url as string) ?? "",
    }
  if (hero_type === "image")
    return { image_url: (o.image_url as string) ?? "", image_media_id: (o.image_media_id as string) ?? "" }
  if (hero_type === "slideshow") return {}
  return {}
}

function parseAboutContent(about_content: Json): AboutContent {
  if (!about_content || typeof about_content !== "object") return {}
  const o = about_content as Record<string, unknown>
  return {
    title: (o.title as string) ?? "",
    body: (o.body as string) ?? "",
    image_url: (o.image_url as string) ?? "",
  }
}

function parseAdditionalSections(additional_sections: Json): AdditionalSection[] {
  if (!Array.isArray(additional_sections)) return []
  return additional_sections as AdditionalSection[]
}

export function HomepageSection({ data, action }: HomepageSectionProps) {
  const [heroType, setHeroType] = useState(data?.hero_type ?? "text")
  const heroParsed = parseHeroConfig(heroType, data?.hero_config ?? {})
  const aboutParsed = parseAboutContent(data?.about_content ?? {})
  const initialSections = parseAdditionalSections(data?.additional_sections ?? [])
  const [heroImageUrl, setHeroImageUrl] = useState(heroParsed.image_url ?? "")

  const [slides, setSlides] = useState<Array<{ url_or_media_id: string; caption: string }>>(() => {
    const raw = data?.hero_config
    if (heroType !== "slideshow" || !Array.isArray(raw)) return [{ url_or_media_id: "", caption: "" }]
    return raw.length
      ? (raw as Array<{ url?: string; media_id?: string; caption?: string }>).map((s) => ({
          url_or_media_id: (s.url ?? s.media_id ?? "") as string,
          caption: (s.caption ?? "") as string,
        }))
      : [{ url_or_media_id: "", caption: "" }]
  })

  const [additionalSections, setAdditionalSections] = useState<AdditionalSection[]>(initialSections)

  const addSlide = useCallback(() => {
    setSlides((prev) => [...prev, { url_or_media_id: "", caption: "" }])
  }, [])
  const removeSlide = useCallback((index: number) => {
    setSlides((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)))
  }, [])
  const updateSlide = useCallback((index: number, field: "url_or_media_id" | "caption", value: string) => {
    setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }, [])

  const addAdditionalSection = useCallback(() => {
    setAdditionalSections((prev) => [...prev, { type: "rich_text", title: "", body: "" }])
  }, [])
  const removeAdditionalSection = useCallback((index: number) => {
    setAdditionalSections((prev) => prev.filter((_, i) => i !== index))
  }, [])
  const updateAdditionalSection = useCallback((index: number, updates: Partial<AdditionalSection>) => {
    setAdditionalSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...updates } : s)))
  }, [])

  return (
    <SettingsSection
      title="Homepage"
      description="Homepage title, hero, welcome, about, analytics, and section limits."
    >
      <form
        action={(formData) => {
          if (heroType === "slideshow") {
            const heroSlides = slides
              .filter((s) => s.url_or_media_id.trim())
              .map((s) => ({ url: s.url_or_media_id.trim(), caption: s.caption.trim() || undefined }))
            formData.set("hero_slides", JSON.stringify(heroSlides))
          }
          formData.set("additional_sections", JSON.stringify(additionalSections))
          return action(formData)
        }}
        className="grid gap-6 sm:grid-cols-2"
      >
        <InputGroup
          name="homepage_title"
          defaultValue={data?.homepage_title ?? ""}
          label="Homepage title"
          className="sm:col-span-2"
        />

        {/* Hero */}
        <div className="sm:col-span-2 space-y-4 rounded-lg border border-(--pw-border) bg-background/50 p-4">
          <h4 className="text-sm font-semibold text-foreground">Hero</h4>
          <Field label="Hero type">
            <Select name="hero_type" value={heroType} onValueChange={(v) => setHeroType(v as "text" | "image" | "slideshow")}>
              <SelectTrigger className="mt-1" />
              <SelectContent>
                <SelectOption value="text">Text w/ action button</SelectOption>
                <SelectOption value="image">Image</SelectOption>
                <SelectOption value="slideshow">Slideshow</SelectOption>
              </SelectContent>
            </Select>
          </Field>

          {heroType === "text" && (
            <>
              <InputGroup name="hero_headline" defaultValue={heroParsed.headline ?? ""} label="Headline" />
              <InputGroup name="hero_subheadline" defaultValue={heroParsed.subheadline ?? ""} label="Subheadline" className="sm:col-span-2" />
              <InputGroup name="hero_button_label" defaultValue={heroParsed.button_label ?? ""} label="Button label" />
              <InputGroup name="hero_button_url" defaultValue={heroParsed.button_url ?? ""} label="Button URL" placeholder="/signup" />
            </>
          )}
          {heroType === "image" && (
            <>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-foreground/70">
                  Image URL
                </label>
                <ImageSelector
                  value={heroImageUrl}
                  onValueChange={setHeroImageUrl}
                  placeholder="Select a hero image"
                  className="mt-1"
                />
                <input type="hidden" name="hero_image_url" value={heroImageUrl} />
              </div>
              <InputGroup name="hero_image_media_id" defaultValue={heroParsed.image_media_id ?? ""} label="Image media ID (optional)" className="sm:col-span-2" />
            </>
          )}
          {heroType === "slideshow" && (
            <div className="sm:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground/80">Slides</span>
                <Button type="button" variant="ghost" size="sm" onClick={addSlide} className="gap-1">
                  <Plus className="h-4 w-4" /> Add slide
                </Button>
              </div>
              {slides.map((slide, i) => (
                <div key={i} className="flex flex-wrap items-end gap-3 rounded border border-(--pw-border) p-3">
                  <InputGroup
                    label="URL or media ID"
                    value={slide.url_or_media_id}
                    onChange={(e) => updateSlide(i, "url_or_media_id", e.target.value)}
                  />
                  <InputGroup
                    label="Caption"
                    value={slide.caption}
                    onChange={(e) => updateSlide(i, "caption", e.target.value)}
                    className="min-w-[120px]"
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeSlide(i)} disabled={slides.length <= 1} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <TextAreaGroup
          className="sm:col-span-2"
          name="welcome_text"
          rows={3}
          defaultValue={data?.welcome_text ?? ""}
          label="Welcome text"
        />

        {/* About */}
        <div className="sm:col-span-2 space-y-4 rounded-lg border border-(--pw-border) bg-background/50 p-4">
          <h4 className="text-sm font-semibold text-foreground">About content</h4>
          <InputGroup name="about_title" defaultValue={aboutParsed.title ?? ""} label="Title" />
          <TextAreaGroup name="about_body" defaultValue={aboutParsed.body ?? ""} rows={4} label="Body" className="sm:col-span-2" />
          <InputGroup name="about_image_url" defaultValue={aboutParsed.image_url ?? ""} label="Image URL (optional)" placeholder="https://…" className="sm:col-span-2" />
        </div>

        <InputGroup
          name="technologies_used"
          defaultValue={data?.technologies_used?.join(", ") ?? ""}
          label="Technologies (comma-separated)"
          className="sm:col-span-2"
          placeholder="React, Next.js, …"
        />
        <InputGroup name="founding_date" defaultValue={data?.founding_date ?? ""} label="Founding date" placeholder="YYYY-MM-DD" />
        <Field label="Member count">
          <NumberInput name="member_count" defaultValue={data?.member_count ?? null} min={0} placeholder="0" />
        </Field>
        <Field label="GitHub repos count">
          <NumberInput name="github_repos_count" defaultValue={data?.github_repos_count ?? null} min={0} placeholder="0" />
        </Field>
        <Field label="Upcoming events limit">
          <NumberInput name="upcoming_events_limit" defaultValue={data?.upcoming_events_limit ?? 5} min={0} />
        </Field>
        <Field label="Announcements limit">
          <NumberInput name="announcements_limit" defaultValue={data?.announcements_limit ?? 5} min={0} />
        </Field>
        <Field label="Featured posts limit">
          <NumberInput name="featured_posts_limit" defaultValue={data?.featured_posts_limit ?? 5} min={0} />
        </Field>

        {/* Additional sections */}
        <div className="sm:col-span-2 space-y-4 rounded-lg border border-(--pw-border) bg-background/50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Additional sections</h4>
            <Button type="button" variant="ghost" size="sm" onClick={addAdditionalSection} className="gap-1">
              <Plus className="h-4 w-4" /> Add section
            </Button>
          </div>
          {additionalSections.length === 0 ? (
            <p className="text-sm text-foreground/70">No sections. Add one to show custom blocks on the homepage.</p>
          ) : (
            <ul className="space-y-3">
              {additionalSections.map((sec, i) => (
                <li key={i} className="flex flex-wrap items-start gap-3 rounded border border-(--pw-border) p-3">
                  <div className="flex items-center gap-2">
                    <Select
                      value={sec.type}
                      onValueChange={(v) => updateAdditionalSection(i, { type: v })}
                    >
                      <SelectTrigger className="w-[140px]" />
                      <SelectContent>
                        <SelectOption value="rich_text">Rich text</SelectOption>
                        <SelectOption value="cards">Cards</SelectOption>
                        <SelectOption value="cta">Call to action</SelectOption>
                      </SelectContent>
                    </Select>
                  </div>
                  {sec.type === "rich_text" && (
                    <>
                      <InputGroup
                        label="Title"
                        value={(sec.title as string) ?? ""}
                        onChange={(e) => updateAdditionalSection(i, { title: e.target.value })}
                        className="min-w-[160px]"
                      />
                      <div className="min-w-[200px] flex-1">
                        <label className="mb-1 block text-sm font-medium text-foreground/80">Body</label>
                        <textarea
                          className="w-full rounded-lg border border-(--pw-border) bg-background px-3 py-2 text-sm text-foreground"
                          rows={2}
                          value={(sec.body as string) ?? ""}
                          onChange={(e) => updateAdditionalSection(i, { body: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                  {sec.type === "cta" && (
                    <>
                      <InputGroup
                        label="Heading"
                        value={(sec.heading as string) ?? ""}
                        onChange={(e) => updateAdditionalSection(i, { heading: e.target.value })}
                        className="min-w-[160px]"
                      />
                      <InputGroup
                        label="Button label"
                        value={(sec.button_label as string) ?? ""}
                        onChange={(e) => updateAdditionalSection(i, { button_label: e.target.value })}
                        className="min-w-[120px]"
                      />
                      <InputGroup
                        label="Button URL"
                        value={(sec.button_url as string) ?? ""}
                        onChange={(e) => updateAdditionalSection(i, { button_url: e.target.value })}
                        className="min-w-[160px]"
                      />
                    </>
                  )}
                  {sec.type === "cards" && (
                    <span className="text-sm text-foreground/70">Cards section — add card items in theme or future editor.</span>
                  )}
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeAdditionalSection(i)} className="text-destructive ml-auto">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="sm:col-span-2">
          <Button
            type="submit"
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
            variant="ghost"
          >
            Save Homepage
          </Button>
        </div>
      </form>
    </SettingsSection>
  )
}
