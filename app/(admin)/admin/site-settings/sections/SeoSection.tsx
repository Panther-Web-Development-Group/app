"use client"

import { useState } from "react"
import { Button } from "@/app/components/Button"
import { Field } from "@/app/components/Form/Field"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { Select, SelectContent, SelectOption, SelectTrigger } from "@/app/components/Form/Select"
import { Tags } from "@/app/components/Form/Tags"
import { TextAreaGroup } from "@/app/components/Form/TextAreaGroup"
import { SeoTargetPicker } from "../SeoTargetPicker"
import { SettingsSection } from "./SettingsSection"
import type { Json } from "@/lib/supabase/types"
import { ImageSelector } from "../../ImageSelector"

type SeoMetadataRow = {
  id: string
  owner_id: string
  post_id: string | null
  page_id: string | null
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string[] | null
  og_title: string | null
  og_description: string | null
  og_image: string | null
  og_type: string | null
  og_url: string | null
  twitter_card: string | null
  twitter_title: string | null
  twitter_description: string | null
  twitter_image: string | null
  twitter_site: string | null
  twitter_creator: string | null
  canonical_url: string | null
  robots: string | null
  structured_data: Json | null
  google_analytics_id: string | null
  facebook_pixel_id: string | null
  created_at: string
  updated_at: string
}

type MinimalPageRow = { id: string; title: string; slug: string; is_published: boolean }
type MinimalPostRow = { id: string; title: string; slug: string; is_published: boolean }

type SeoSectionProps = {
  pages: MinimalPageRow[]
  posts: MinimalPostRow[]
  seo: SeoMetadataRow[]
  globalSeo: SeoMetadataRow | null
  pageById: Map<string, MinimalPageRow>
  postById: Map<string, MinimalPostRow>
  onUpsert: (formData: FormData) => Promise<void>
  onDelete: (formData: FormData) => Promise<void>
}

export function SeoSection({
  pages,
  posts,
  seo,
  globalSeo,
  pageById,
  postById,
  onUpsert,
  onDelete,
}: SeoSectionProps) {
  const [ogImage, setOgImage] = useState(globalSeo?.og_image ?? "")
  const [twitterImage, setTwitterImage] = useState(globalSeo?.twitter_image ?? "")

  return (
    <SettingsSection
      title="SEO Metadata"
      description="Site-wide, page, or post SEO (title, description, analytics)."
    >
      <form action={onUpsert} className="grid gap-4 sm:grid-cols-2">
        <SeoTargetPicker pages={pages} posts={posts} className="sm:col-span-2" />
        <InputGroup
          className="sm:col-span-2"
          name="meta_title"
          defaultValue={globalSeo?.meta_title ?? ""}
          placeholder="(max ~60 chars)"
          label="Meta title"
          descriptionType="tooltip"
          description="Recommended max ~60 characters."
        />
        <TextAreaGroup
          className="sm:col-span-2"
          name="meta_description"
          rows={3}
          defaultValue={globalSeo?.meta_description ?? ""}
          placeholder="(max ~160 chars)"
          label="Meta description"
          descriptionType="tooltip"
          description="Recommended max ~160 characters."
        />
        <Field label="Keywords" className="sm:col-span-2">
          <Tags
            name="meta_keywords"
            placeholder="Add keyword…"
            allowDuplicates={false}
            defaultValue={globalSeo?.meta_keywords ?? []}
          />
        </Field>
        <InputGroup name="og_type" defaultValue={globalSeo?.og_type ?? "website"} placeholder="website" label="OG type" />
        <Field label="Twitter card">
          <Select name="twitter_card" defaultValue={globalSeo?.twitter_card ?? "summary_large_image"}>
            <SelectTrigger className="mt-1" />
            <SelectContent>
              <SelectOption value="summary">summary</SelectOption>
              <SelectOption value="summary_large_image">summary_large_image</SelectOption>
              <SelectOption value="app">app</SelectOption>
              <SelectOption value="player">player</SelectOption>
            </SelectContent>
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-foreground/70">
            OG image URL
          </label>
          <ImageSelector
            value={ogImage}
            onValueChange={setOgImage}
            placeholder="Select OG image"
            className="mt-1"
          />
          <input type="hidden" name="og_image" value={ogImage} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-foreground/70">
            Twitter image URL
          </label>
          <ImageSelector
            value={twitterImage}
            onValueChange={setTwitterImage}
            placeholder="Select Twitter image"
            className="mt-1"
          />
          <input type="hidden" name="twitter_image" value={twitterImage} />
        </div>
        <InputGroup name="canonical_url" defaultValue={globalSeo?.canonical_url ?? ""} placeholder="https://example.com/path" label="Canonical URL" className="sm:col-span-2" />
        <InputGroup name="robots" defaultValue={globalSeo?.robots ?? ""} placeholder="index,follow" label="Robots" className="sm:col-span-2" />
        <InputGroup name="google_analytics_id" defaultValue={globalSeo?.google_analytics_id ?? ""} placeholder="G-XXXXXXXXXX" label="Google Analytics ID" />
        <InputGroup name="facebook_pixel_id" defaultValue={globalSeo?.facebook_pixel_id ?? ""} placeholder="Pixel ID" label="Facebook Pixel ID" />
        <TextAreaGroup
          className="sm:col-span-2"
          name="structured_data"
          rows={4}
          defaultValue={globalSeo?.structured_data ? JSON.stringify(globalSeo.structured_data) : ""}
          placeholder='{"@context":"https://schema.org","@type":"WebSite","name":"…"}'
          label="Structured data (JSON-LD)"
        />
        <div className="sm:col-span-2">
          <Button
            type="submit"
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
            variant="ghost"
          >
            Save SEO Metadata
          </Button>
        </div>
      </form>
      {seo.length === 0 ? (
        <div className="mt-6 rounded-lg border border-(--pw-border) bg-background/5 p-6">
          <p className="text-foreground/75">No SEO metadata entries yet.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-(--pw-border) bg-secondary/20">
          <table className="min-w-full divide-y divide-(--pw-border)">
            <thead className="bg-secondary/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">Target</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">Meta title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">Updated</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground/70">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--pw-border)">
              {seo.map((row) => {
                const target =
                  row.post_id === null && row.page_id === null
                    ? "Global site"
                    : row.page_id && pageById.get(row.page_id)
                      ? `Page: ${pageById.get(row.page_id)!.title}`
                      : row.post_id && postById.get(row.post_id)
                        ? `Post: ${postById.get(row.post_id)!.title}`
                        : row.page_id
                          ? `Page: ${row.page_id}`
                          : row.post_id
                            ? `Post: ${row.post_id}`
                            : "—"
                return (
                  <tr key={row.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-foreground">{target}</div>
                      <div className="mt-1 text-xs text-foreground/70">
                        {row.page_id ? "page" : "post"} • <code className="rounded border border-(--pw-border) bg-background/10 px-2 py-0.5">{row.page_id ?? row.post_id}</code>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground/80">{row.meta_title ?? "—"}</td>
                    <td className="px-6 py-4 text-sm text-foreground/70">{new Date(row.updated_at).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <form action={onDelete} className="inline">
                        <input type="hidden" name="id" value={row.id} />
                        <Button type="submit" variant="ghost" className="rounded-lg border border-(--pw-border) bg-background/10 px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-background/20">
                          Delete
                        </Button>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </SettingsSection>
  )
}
