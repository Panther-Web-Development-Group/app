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
import { RadioGroup } from "@/app/components/Form/RadioGroup"
import { Select } from "@/app/components/Form/Select"
import { SortableList } from "@/app/components/SortableList"

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

  // Generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
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
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {isNew ? "Create Page" : "Edit Page"}
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {renderMode === "sections"
              ? "Build this page from sections (full + partial widths)"
              : "Edit your page content"}
          </p>
        </div>
        <Link
          href="/admin/pages"
          className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
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

      <div className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid gap-4 md:grid-cols-2">
          <InputGroup
            required
            label="Title"
            value={title}
            onChange={(e) => {
              const nextTitle = e.target.value
              setTitle(nextTitle)
              if (slugLocked) setSlug(generateSlug(nextTitle))
            }}
            placeholder="Page title"
            labelClassName="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            inputClassName="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
          />

          <InputGroup
            required
            label="Slug"
            value={slug}
            readOnly={slugLocked}
            onChange={(e) => {
              if (slugLocked) return
              setSlug(e.target.value)
            }}
            placeholder="page-slug"
            labelClassName="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            inputClassName="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 read-only:bg-zinc-50 read-only:text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600 dark:read-only:bg-zinc-950 dark:read-only:text-zinc-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            checked={slugLocked}
            onCheckedChange={(next) => {
              setSlugLocked(next)
              if (next) setSlug(generateSlug(title))
            }}
            label={
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                Auto-generate slug from title
              </span>
            }
          />
        </div>

        <div>
          <TextAreaGroup
            name="summary"
            value={summary || ""}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief description of the page"
            label="Summary"
            rows={3}
            textAreaClassName="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
          />
        </div>

        <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Page hero image
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Optional hero image shown at the top of the published page.
              </p>
            </div>

            <Checkbox
              checked={heroImageEnabled}
              onCheckedChange={setHeroImageEnabled}
              label={<span className="text-sm text-zinc-700 dark:text-zinc-300">Enabled</span>}
            />
          </div>

          {heroImageEnabled ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <InputGroup
                  label="Hero image URL"
                  labelClassName="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  placeholder="https://…"
                  inputClassName="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <InputGroup
                  label="Alt text (optional)"
                  labelClassName="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                  value={heroImageAlt}
                  onChange={(e) => setHeroImageAlt(e.target.value)}
                  placeholder="Describe the image"
                  inputClassName="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-end">
                <Checkbox
                  checked={heroConstrainToContainer}
                  onCheckedChange={setHeroConstrainToContainer}
                  label={
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      Constrain hero to content width
                    </span>
                  }
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
            label={<span className="text-sm text-zinc-700 dark:text-zinc-300">Published</span>}
          />
        </div>

        {renderMode === "whole" ? (
          <div>
            <Editor
              label="Content"
              required
              labelClassName="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Sections
                </h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Full width sections span 12 columns. Partial sections use a 12-column grid.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => {
                  resetSectionDraft()
                  setSectionOrder((orderedSections.at(-1)?.order_index ?? 0) + 1)
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                variant="ghost"
              >
                <Plus className="h-4 w-4" />
                New section
              </Button>
            </div>

            {orderedSections.length === 0 ? (
              <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                No sections yet.
              </div>
            ) : (
              <SortableList
                items={orderedSections}
                onReorder={handleReorderSections}
                onReorderEnd={persistSectionOrder}
                itemClassName="rounded-lg border border-zinc-200 bg-white p-4 pl-12 dark:border-zinc-800 dark:bg-zinc-950"
                renderItem={(s) => (
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                          {s.order_index}
                        </span>
                        <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {s.title || "Untitled section"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
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
                        className="rounded-lg border border-zinc-200 p-2 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
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
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {editingSectionId ? "Edit section" : "New section"}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                <InputGroup
                  label="Section title"
                  labelClassName="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  placeholder="e.g. Hero"
                  inputClassName="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
                </div>

                <div>
                <InputGroup
                  label="Icon (lucide name)"
                  labelClassName="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                  value={sectionIcon}
                  onChange={(e) => setSectionIcon(e.target.value)}
                  placeholder="e.g. home, info, sparkles"
                  inputClassName="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
                </div>

                <div className="grid gap-3 sm:grid-cols-12 md:col-span-2">
                  <div className="sm:col-span-6">
                    <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
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
                    <InputGroup
                      label="Span"
                      labelClassName="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                      type="number"
                      min={1}
                      max={12}
                      value={sectionSpan}
                      onChange={(e) => setSectionSpan(Number(e.target.value))}
                      disabled={sectionWidth !== "partial"}
                      inputClassName="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <InputGroup
                      label="Order"
                      labelClassName="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                      type="number"
                      value={sectionOrder}
                      onChange={(e) => setSectionOrder(Number(e.target.value))}
                      inputClassName="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Content type
                  </label>
                  <Select
                    value={sectionType}
                    onValueChange={(v) =>
                      setSectionType(v as "hero" | "card" | "richText" | "custom")
                    }
                  >
                    <Select.Trigger className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50" />
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
                        labelClassName="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                        value={heroHeadline}
                        onChange={(e) => setHeroHeadline(e.target.value)}
                        inputClassName="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                      />
                    </div>
                    <div>
                      <InputGroup
                        label="Subheadline"
                        labelClassName="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                        value={heroSubheadline}
                        onChange={(e) => setHeroSubheadline(e.target.value)}
                        inputClassName="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                      />
                    </div>
                  </div>
                ) : null}

                {sectionType === "card" ? (
                  <div className="space-y-3">
                    <div>
                      <InputGroup
                        label="Card title"
                        labelClassName="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                        value={cardTitle}
                        onChange={(e) => setCardTitle(e.target.value)}
                        inputClassName="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                      />
                    </div>
                    <div>
                      <TextAreaGroup
                        label="Body"
                        labelClassName="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                        value={cardBody}
                        onChange={(e) => setCardBody(e.target.value)}
                        rows={3}
                        textAreaClassName="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                      />
                    </div>
                  </div>
                ) : null}

                {sectionType === "richText" ? (
                  <div>
                    <Editor
                      resetKey={`section-richText-${editingSectionId ?? "new"}`}
                      label="Content"
                      labelClassName="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                      initialContent={richHtml}
                      onChange={(_state, _editor, html) => setRichHtml(html)}
                      placeholder="Write rich text content here…"
                      editorContainerClassName="border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900"
                      contentMinHeightClassName="min-h-[144px]"
                      contentClassName="px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 prose-zinc dark:prose-invert"
                    />
                  </div>
                ) : null}

                <div>
                  <TextAreaGroup
                    label="Thumbnails (JSON array)"
                    labelClassName="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                    value={thumbnailsJson}
                    onChange={(e) => setThumbnailsJson(e.target.value)}
                    rows={4}
                    placeholder='[{"src":"https://…","caption":"…","alt":"…"}]'
                    textAreaClassName="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    description="Optional. Use `src` (or `url`) plus optional `caption` and `alt`."
                    descriptionClassName="mt-1 text-xs text-zinc-500 dark:text-zinc-400"
                    collapseOnBlur={false}
                  />
                </div>

                {sectionType === "custom" ? (
                  <div>
                    <TextAreaGroup
                      label="JSON"
                      labelClassName="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                      value={customJson}
                      onChange={(e) => setCustomJson(e.target.value)}
                      rows={6}
                      placeholder='{"type":"hero","headline":"Welcome"}'
                      textAreaClassName="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={handleSaveSection}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  variant="ghost"
                >
                  <Save className="h-4 w-4" />
                  Save section
                </Button>
                <Button
                  type="button"
                  onClick={resetSectionDraft}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button
            type="button"
            onClick={() => handleSavePage(false)}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
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
