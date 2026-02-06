"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Editor, getEditorStateAsJSON } from "@/app/components/Form/Editor"
import { EditorState, LexicalEditor } from "lexical"
import { Eye, Pencil, Plus, Save, Trash2, X } from "lucide-react"
import type { Json } from "@/lib/supabase/types"
import { Button } from "@/app/components/Button"
import { Checkbox } from "@/app/components/Form/Checkbox"
import { TextAreaGroup } from "@/app/components/Form/TextAreaGroup"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { TitleWithSlug } from "./TitleWithSlug"
import { NumberInput } from "@/app/components/Form/Number"
import { RadioGroup } from "@/app/components/Form/RadioGroup"
import { Select } from "@/app/components/Form/Select"
import { SortableList } from "@/app/components/SortableList"
import { ImageSelector } from "../ImageSelector"

type PageRenderMode = "whole" | "sections"
type PageSectionWidth = "full" | "partial"

interface Page {
  id: string
  title: string
  slug: string
  summary?: string | null
  content: unknown
  render_mode?: PageRenderMode
  is_published: boolean
  hero_image_enabled?: boolean
  hero_image_url?: string | null
  hero_image_alt?: string | null
  hero_constrain_to_container?: boolean
}

interface PageSection {
  id: string
  page_id: string
  title: string | null
  icon: string | null
  width: PageSectionWidth
  column_span: number | null
  order_index: number
  content: Json
}

type ActionResult<T> = { data?: T; error?: string }

interface EditPageFormProps {
  page: Page | null
  sections: PageSection[]
  isNew: boolean

  createPage: (data: {
    title: string
    slug: string
    summary?: string
    content?: Json
    render_mode?: PageRenderMode
    is_published?: boolean
    hero_image_enabled?: boolean
    hero_image_url?: string
    hero_image_alt?: string
    hero_constrain_to_container?: boolean
  }) => Promise<ActionResult<{ id: string; slug: string }>>

  updatePage: (
    id: string,
    data: {
      title?: string
      slug?: string
      summary?: string
      content?: Json
      render_mode?: PageRenderMode
      is_published?: boolean
      hero_image_enabled?: boolean
      hero_image_url?: string
      hero_image_alt?: string
      hero_constrain_to_container?: boolean
    },
  ) => Promise<ActionResult<{ id: string; slug: string }>>

  createSection: (data: {
    page_id: string
    title?: string | null
    icon?: string | null
    width?: PageSectionWidth
    column_span?: number | null
    order_index?: number
    content?: Json
  }) => Promise<ActionResult<{ id: string; page_id: string }>>

  updateSection: (
    id: string,
    data: {
      title?: string | null
      icon?: string | null
      width?: PageSectionWidth
      column_span?: number | null
      order_index?: number
      content?: Json
    },
  ) => Promise<ActionResult<{ id: string; page_id: string }>>

  deleteSection: (id: string) => Promise<{ success?: true; error?: string }>
}

function inferSectionType(content: unknown): "hero" | "card" | "richText" | "custom" {
  if (!content || typeof content !== "object") return "custom"
  const t = (content as { type?: unknown }).type
  if (t === "hero" || t === "card" || t === "richText") return t
  return "custom"
}

type JsonObject = { [key: string]: Json | undefined }
function asJsonObject(value: Json): JsonObject | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null
  return value as JsonObject
}

export function EditPageForm({
  page,
  sections,
  isNew,
  createPage,
  updatePage,
  createSection,
  updateSection,
  deleteSection,
}: EditPageFormProps) {
  const router = useRouter()

  const [title, setTitle] = useState(page?.title || "")
  const [slug, setSlug] = useState(page?.slug || "")
  const [summary, setSummary] = useState(page?.summary || "")
  const [isPublished, setIsPublished] = useState(page?.is_published || false)
  const [renderMode, setRenderMode] = useState<PageRenderMode>(
    page?.render_mode || "whole",
  )
  const [heroImageEnabled, setHeroImageEnabled] = useState<boolean>(
    Boolean(page?.hero_image_enabled),
  )
  const [heroImageUrl, setHeroImageUrl] = useState(page?.hero_image_url || "")
  const [heroImageAlt, setHeroImageAlt] = useState(page?.hero_image_alt || "")
  const [heroConstrainToContainer, setHeroConstrainToContainer] = useState<boolean>(
    page?.hero_constrain_to_container ?? true,
  )

  // Slug behavior:
  // - when locked, slug is read-only and always auto-generated from Title
  // - when unlocked, slug is user-editable and stops auto-updating
  const [slugLocked, setSlugLocked] = useState<boolean>(isNew ? true : false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Whole-page editor state
  const [editorState, setEditorState] = useState<string | null>(() => {
    const c = page?.content as unknown
    if (!c) return null
    if (typeof c === "string") return c
    if (typeof c === "object" && c && "root" in c) return JSON.stringify(c)
    if (typeof c === "object" && c && "html" in c && typeof (c as { html?: unknown }).html === "string")
      return (c as { html: string }).html
    return null
  })
  const editorRef = useRef<LexicalEditor | null>(null)

  // Sections editor state
  const sectionsSorted = useMemo(
    () =>
      [...(sections || [])].sort(
        (a, b) => (a.order_index || 0) - (b.order_index || 0),
      ),
    [sections],
  )

  const [orderedSections, setOrderedSections] = useState<PageSection[]>(sectionsSorted)
  useEffect(() => {
    setOrderedSections(sectionsSorted)
  }, [sectionsSorted])

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [sectionTitle, setSectionTitle] = useState("")
  const [sectionIcon, setSectionIcon] = useState("")
  const [sectionWidth, setSectionWidth] = useState<PageSectionWidth>("full")
  const [sectionSpan, setSectionSpan] = useState<number>(6)
  const [sectionOrder, setSectionOrder] = useState<number>(0)
  const [sectionType, setSectionType] = useState<
    "hero" | "card" | "richText" | "custom"
  >("hero")
  const [heroHeadline, setHeroHeadline] = useState("")
  const [heroSubheadline, setHeroSubheadline] = useState("")
  const [cardTitle, setCardTitle] = useState("")
  const [cardBody, setCardBody] = useState("")
  const [richHtml, setRichHtml] = useState("")
  const [thumbnailsJson, setThumbnailsJson] = useState("[]")
  const [customJson, setCustomJson] = useState("{}")

  const resetSectionDraft = () => {
    setEditingSectionId(null)
    setSectionTitle("")
    setSectionIcon("")
    setSectionWidth("full")
    setSectionSpan(6)
    setSectionOrder(0)
    setSectionType("hero")
    setHeroHeadline("")
    setHeroSubheadline("")
    setCardTitle("")
    setCardBody("")
    setRichHtml("")
    setThumbnailsJson("[]")
    setCustomJson("{}")
  }

  const startEditSection = (s: PageSection) => {
    setEditingSectionId(s.id)
    setSectionTitle(s.title || "")
    setSectionIcon(s.icon || "")
    setSectionWidth(s.width || "full")
    setSectionSpan(s.column_span || 6)
    setSectionOrder(s.order_index || 0)

    const t = inferSectionType(s.content)
    setSectionType(t)

    const obj = asJsonObject(s.content)
    const thumbs = obj?.thumbnails ?? obj?.thumbnail
    setThumbnailsJson(thumbs != null ? JSON.stringify(thumbs, null, 2) : "[]")

    if (t === "hero") {
      setHeroHeadline(typeof obj?.headline === "string" ? obj.headline : "")
      setHeroSubheadline(typeof obj?.subheadline === "string" ? obj.subheadline : "")
    } else if (t === "card") {
      setCardTitle(typeof obj?.title === "string" ? obj.title : "")
      setCardBody(typeof obj?.body === "string" ? obj.body : "")
    } else if (t === "richText") {
      setRichHtml(typeof obj?.html === "string" ? obj.html : "")
    } else {
      setCustomJson(JSON.stringify(s.content ?? {}, null, 2))
    }
  }

  const buildSectionContent = () => {
    let thumbnails: unknown[] | null = null
    try {
      const parsed = JSON.parse(thumbnailsJson || "[]")
      thumbnails = Array.isArray(parsed) ? parsed : null
    } catch {
      thumbnails = null
    }

    if (sectionType === "hero") {
      const base: Record<string, unknown> = {
        type: "hero",
        headline: heroHeadline,
        subheadline: heroSubheadline,
      }
      if (thumbnails && thumbnails.length) base.thumbnails = thumbnails
      return base as unknown as Json
    }
    if (sectionType === "card") {
      const base: Record<string, unknown> = {
        type: "card",
        title: cardTitle,
        body: cardBody,
      }
      if (thumbnails && thumbnails.length) base.thumbnails = thumbnails
      return base as unknown as Json
    }
    if (sectionType === "richText") {
      const base: Record<string, unknown> = { type: "richText", html: richHtml }
      if (thumbnails && thumbnails.length) base.thumbnails = thumbnails
      return base as unknown as Json
    }
    try {
      return JSON.parse(customJson || "{}")
    } catch {
      return {}
    }
  }

  const handleEditorChange = async (
    _state: EditorState,
    editor: LexicalEditor,
  ) => {
    editorRef.current = editor
    const json = await getEditorStateAsJSON(editor)
    setEditorState(json)
  }

  const handleSavePage = async (publish: boolean) => {
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required")
      return
    }

    if (heroImageEnabled && !heroImageUrl.trim()) {
      setError("Hero image URL is required when hero image is enabled")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const base = {
        title: title.trim(),
        slug: slug.trim(),
        summary: summary.trim() || undefined,
        render_mode: renderMode,
        is_published: publish || isPublished,
        hero_image_enabled: heroImageEnabled,
        hero_image_url: heroImageUrl.trim() || undefined,
        hero_image_alt: heroImageAlt.trim() || undefined,
        hero_constrain_to_container: heroConstrainToContainer,
      } as const

      let result: ActionResult<{ id: string; slug: string }>

      if (isNew) {
        if (renderMode === "whole") {
          if (!editorRef.current) {
            setError("Editor content is required")
            return
          }
          const contentJson = await getEditorStateAsJSON(editorRef.current)
          const content = JSON.parse(contentJson)
          result = await createPage({ ...base, content })
        } else {
          result = await createPage({ ...base, content: {} })
        }
      } else {
        if (renderMode === "whole") {
          if (!editorRef.current) {
            setError("Editor content is required")
            return
          }
          const contentJson = await getEditorStateAsJSON(editorRef.current)
          const content = JSON.parse(contentJson)
          result = await updatePage(page!.id, { ...base, content })
        } else {
          // sections mode: don't touch pages.content (keep whatever was there)
          result = await updatePage(page!.id, { ...base })
        }
      }

      if (result.error) {
        setError(result.error)
        return
      }

      if (isNew && result.data?.id) {
        router.push(`/admin/pages/${result.data.id}`)
        router.refresh()
        return
      }

      // Stay on page and refresh server data
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save page")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSection = async () => {
    if (!page?.id) {
      setError("Save the page first before adding sections.")
      return
    }

    setSaving(true)
    setError(null)

    const content = buildSectionContent()
    const payload = {
      title: sectionTitle.trim() ? sectionTitle.trim() : null,
      icon: sectionIcon.trim() ? sectionIcon.trim() : null,
      width: sectionWidth,
      column_span: sectionWidth === "partial" ? sectionSpan : null,
      order_index: Number.isFinite(sectionOrder) ? sectionOrder : 0,
      content,
    }

    try {
      const result = editingSectionId
        ? await updateSection(editingSectionId, payload)
        : await createSection({ page_id: page.id, ...payload })

      if (result.error) {
        setError(result.error)
        return
      }

      resetSectionDraft()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save section")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSection = async (id: string) => {
    if (!confirm("Delete this section?")) return
    setSaving(true)
    setError(null)
    try {
      const res = await deleteSection(id)
      if (res.error) {
        setError(res.error)
        return
      }
      if (editingSectionId === id) resetSectionDraft()
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const persistSectionOrder = async (next: PageSection[]) => {
    if (!page) return
    setSaving(true)
    setError(null)

    // Renumber 1..N in the order shown
    const renumbered = next.map((s, idx) => ({ ...s, order_index: idx + 1 }))
    setOrderedSections(renumbered)

    try {
      for (const s of renumbered) {
        const res = await updateSection(s.id, { order_index: s.order_index })
        if (res.error) {
          setError(res.error)
          return
        }
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reorder sections")
    } finally {
      setSaving(false)
    }
  }

  const handleReorderSections = (next: PageSection[]) => {
    // Renumber locally for accurate badges while dragging
    setOrderedSections(next.map((s, idx) => ({ ...s, order_index: idx + 1 })))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {isNew ? "Create Page" : "Edit Page"}
          </h2>
          <p className="mt-2 text-foreground/70">
            {renderMode === "sections"
              ? "Build this page from sections (full + partial widths)"
              : "Edit your page content"}
          </p>
        </div>
        <Link
          href="/admin/pages"
          className="flex items-center gap-2 rounded-lg border border-(--pw-border) px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-background/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--pw-ring)"
        >
          <X className="h-4 w-4" />
          Back
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="space-y-6 rounded-lg border border-(--pw-border) bg-background p-6">
        <TitleWithSlug
          title={title}
          slug={slug}
          slugLocked={slugLocked}
          onTitleChange={setTitle}
          onSlugChange={setSlug}
          onSlugLockedChange={setSlugLocked}
          titlePlaceholder="Page title"
          slugPlaceholder="page-slug"
          titleLabel="Title"
          slugLabel="Slug"
          required
        />

        <div>
          <TextAreaGroup
            name="summary"
            value={summary || ""}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief description of the page"
            label="Summary"
            rows={3}
            textAreaClassName="rounded-lg border border-(--pw-border) bg-background px-3 py-2 text-foreground placeholder-foreground/50 outline-none focus:ring-2 focus:ring-(--pw-ring)"
          />
        </div>

        <div className="space-y-3 rounded-lg border border-(--pw-border) bg-secondary/20 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-foreground">
                Page hero image
              </div>
              <p className="mt-1 text-sm text-foreground/70">
                Optional hero image shown at the top of the published page.
              </p>
            </div>

            <Checkbox
              checked={heroImageEnabled}
              onCheckedChange={setHeroImageEnabled}
              label={<span className="text-sm text-foreground/80">Enabled</span>}
            />
          </div>

          {heroImageEnabled ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-foreground/70">
                  Hero image URL
                </label>
                <ImageSelector
                  value={heroImageUrl}
                  onValueChange={setHeroImageUrl}
                  placeholder="Select a hero image"
                  className="mt-1"
                />
              </div>

              <div>
                <InputGroup
                  label="Alt text (optional)"
                  labelClassName="mb-1 block text-xs font-medium text-foreground/70"
                  value={heroImageAlt}
                  onChange={(e) => setHeroImageAlt(e.target.value)}
                  placeholder="Describe the image"
                  inputClassName="w-full rounded-lg border border-(--pw-border) bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>

              <div className="flex items-end">
                <Checkbox
                  checked={heroConstrainToContainer}
                  onCheckedChange={setHeroConstrainToContainer}
                  label={
                    <span className="text-sm text-foreground/80">
                      Constrain hero to content width
                    </span>
                  }
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-(--pw-border) bg-secondary/20 p-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-foreground/80">
              Mode
            </label>
            <RadioGroup
              value={renderMode}
              onValueChange={(v) => setRenderMode(v as PageRenderMode)}
              className="flex items-center gap-3"
            >
              <RadioGroup.Option value="whole" label="Whole page" />
              <RadioGroup.Option value="sections" label="Sections" />
            </RadioGroup>
          </div>

          <Checkbox
            checked={isPublished}
            onCheckedChange={setIsPublished}
            label={<span className="text-sm text-foreground/80">Published</span>}
          />
        </div>

        {renderMode === "whole" ? (
          <div>
            <Editor
              label="Content"
              required
              labelClassName="mb-2 block text-sm font-medium text-foreground/80"
              contentMinHeightClassName="min-h-[220px]"
              initialContent={editorState}
              onChange={handleEditorChange}
              placeholder="Write your page content here..."
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Sections
                </h3>
                <p className="mt-1 text-sm text-foreground/70">
                  Full width sections span 12 columns. Partial sections use a 12-column grid.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => {
                  resetSectionDraft()
                  setSectionOrder((orderedSections.at(-1)?.order_index ?? 0) + 1)
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
                variant="ghost"
              >
                <Plus className="h-4 w-4" />
                New section
              </Button>
            </div>

            {orderedSections.length === 0 ? (
              <div className="rounded-lg border border-(--pw-border) bg-background p-4 text-sm text-foreground/70">
                No sections yet.
              </div>
            ) : (
              <SortableList
                items={orderedSections}
                onReorder={handleReorderSections}
                onReorderEnd={persistSectionOrder}
                itemClassName="rounded-lg border border-(--pw-border) bg-background p-4 pl-12"
                renderItem={(s) => (
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-secondary/30 px-2 py-0.5 text-xs text-foreground/80">
                          {s.order_index}
                        </span>
                        <span className="truncate text-sm font-medium text-foreground">
                          {s.title || "Untitled section"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-foreground/60">
                        {s.width}
                        {s.width === "partial" && s.column_span
                          ? ` • span ${s.column_span}/12`
                          : ""}
                        {s.icon ? ` • icon: ${s.icon}` : ""}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => startEditSection(s)}
                        className="rounded-lg border border-(--pw-border) p-2 text-foreground/80 hover:bg-background/10"
                        aria-label="Edit section"
                        variant="icon"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleDeleteSection(s.id)}
                        className="rounded-lg border border-red-200 p-2 text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:text-red-200 dark:hover:bg-red-900/20"
                        aria-label="Delete section"
                        variant="icon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              >
              </SortableList>
            )}

            {/* Section editor */}
            <div className="rounded-lg border border-(--pw-border) bg-background p-4">
              <div className="mb-3 text-sm font-semibold text-foreground">
                {editingSectionId ? "Edit section" : "New section"}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                <InputGroup
                  label="Section title"
                  labelClassName="mb-1 block text-xs font-medium text-foreground/70"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  placeholder="e.g. Hero"
                  inputClassName="w-full rounded-lg border border-(--pw-border) bg-background px-3 py-2 text-sm text-foreground"
                />
                </div>

                <div>
                <InputGroup
                  label="Icon (lucide name)"
                  labelClassName="mb-1 block text-xs font-medium text-foreground/70"
                  value={sectionIcon}
                  onChange={(e) => setSectionIcon(e.target.value)}
                  placeholder="e.g. home, info, sparkles"
                  inputClassName="w-full rounded-lg border border-(--pw-border) bg-background px-3 py-2 text-sm text-foreground"
                />
                </div>

                <div className="grid gap-3 sm:grid-cols-12 md:col-span-2">
                  <div className="sm:col-span-6">
                    <label className="mb-1 block text-xs font-medium text-foreground/70">
                      Width
                    </label>
                    <RadioGroup
                      value={sectionWidth}
                      onValueChange={(v) => setSectionWidth(v as PageSectionWidth)}
                      className="mt-1 flex flex-wrap gap-3"
                    >
                      <RadioGroup.Option value="full" label="Full" />
                      <RadioGroup.Option value="partial" label="Partial" />
                    </RadioGroup>
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="edit-page-section-span" className="mb-1 block text-xs font-medium text-foreground/70">
                      Span
                    </label>
                    <NumberInput
                      id="edit-page-section-span"
                      min={1}
                      max={12}
                      value={sectionSpan}
                      onValueChange={(v) => setSectionSpan(v ?? 6)}
                      disabled={sectionWidth !== "partial"}
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="edit-page-section-order" className="mb-1 block text-xs font-medium text-foreground/70">
                      Order
                    </label>
                    <NumberInput
                      id="edit-page-section-order"
                      value={sectionOrder}
                      onValueChange={(v) => setSectionOrder(v ?? 0)}
                      className="mt-1"
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground/70">
                    Content type
                  </label>
                  <Select
                    value={sectionType}
                    onValueChange={(v) =>
                      setSectionType(v as "hero" | "card" | "richText" | "custom")
                    }
                  >
                    <Select.Trigger className="mt-1 w-full rounded-lg border border-(--pw-border) bg-background px-3 py-2 text-sm text-foreground" />
                    <Select.Content>
                      <Select.Option value="hero">Hero</Select.Option>
                      <Select.Option value="card">Card</Select.Option>
                      <Select.Option value="richText">Rich text (HTML)</Select.Option>
                      <Select.Option value="custom">Custom JSON</Select.Option>
                    </Select.Content>
                  </Select>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {sectionType === "hero" ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <InputGroup
                        label="Headline"
                        labelClassName="mb-1 block text-xs font-medium text-foreground/70"
                        value={heroHeadline}
                        onChange={(e) => setHeroHeadline(e.target.value)}
                        inputClassName="w-full rounded-lg border border-(--pw-border) bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </div>
                    <div>
                      <InputGroup
                        label="Subheadline"
                        labelClassName="mb-1 block text-xs font-medium text-foreground/70"
                        value={heroSubheadline}
                        onChange={(e) => setHeroSubheadline(e.target.value)}
                        inputClassName="w-full rounded-lg border border-(--pw-border) bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </div>
                  </div>
                ) : null}

                {sectionType === "card" ? (
                  <div className="space-y-3">
                    <div>
                      <InputGroup
                        label="Card title"
                        labelClassName="mb-1 block text-xs font-medium text-foreground/70"
                        value={cardTitle}
                        onChange={(e) => setCardTitle(e.target.value)}
                        inputClassName="w-full rounded-lg border border-(--pw-border) bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </div>
                    <div>
                      <TextAreaGroup
                        label="Body"
                        labelClassName="mb-1 block text-xs font-medium text-foreground/70"
                        value={cardBody}
                        onChange={(e) => setCardBody(e.target.value)}
                        rows={3}
                        textAreaClassName="w-full rounded-lg border border-(--pw-border) bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </div>
                  </div>
                ) : null}

                {sectionType === "richText" ? (
                  <div>
                    <Editor
                      resetKey={`section-richText-${editingSectionId ?? "new"}`}
                      label="Content"
                      labelClassName="mb-1 block text-xs font-medium text-foreground/70"
                      initialContent={richHtml}
                      onChange={(_state, _editor, html) => setRichHtml(html)}
                      placeholder="Write rich text content here…"
                      editorContainerClassName="border-(--pw-border) bg-background/10"
                      contentMinHeightClassName="min-h-[144px]"
                      contentClassName="px-3 py-2 text-sm text-foreground prose prose-invert"
                    />
                  </div>
                ) : null}

                <div>
                  <TextAreaGroup
                    label="Thumbnails (JSON array)"
                    labelClassName="mb-1 block text-xs font-medium text-foreground/70"
                    value={thumbnailsJson}
                    onChange={(e) => setThumbnailsJson(e.target.value)}
                    rows={4}
                    placeholder='[{"src":"https://…","caption":"…","alt":"…"}]'
                    textAreaClassName="w-full rounded-lg border border-(--pw-border) bg-background px-3 py-2 font-mono text-xs text-foreground"
                    description="Optional. Use `src` (or `url`) plus optional `caption` and `alt`."
                    descriptionClassName="mt-1 text-xs text-foreground/60"
                    collapseOnBlur={false}
                  />
                </div>

                {sectionType === "custom" ? (
                  <div>
                    <TextAreaGroup
                      label="JSON"
                      labelClassName="mb-1 block text-xs font-medium text-foreground/70"
                      value={customJson}
                      onChange={(e) => setCustomJson(e.target.value)}
                      rows={6}
                      placeholder='{"type":"hero","headline":"Welcome"}'
                      textAreaClassName="w-full rounded-lg border border-(--pw-border) bg-background px-3 py-2 font-mono text-xs text-foreground"
                    />
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={handleSaveSection}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-60"
                  variant="ghost"
                >
                  <Save className="h-4 w-4" />
                  Save section
                </Button>
                <Button
                  type="button"
                  onClick={resetSectionDraft}
                  className="inline-flex items-center gap-2 rounded-lg border border-(--pw-border) bg-background px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-background/10"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-(--pw-border)">
          <Button
            type="button"
            onClick={() => handleSavePage(false)}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-(--pw-ring) disabled:cursor-not-allowed disabled:opacity-60"
            variant="ghost"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            type="button"
            onClick={() => handleSavePage(true)}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            variant="ghost"
          >
            <Eye className="h-4 w-4" />
            {saving ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  )
}
