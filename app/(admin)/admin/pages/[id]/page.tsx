import { notFound } from "next/navigation"
import { requireAuth } from "@/lib/supabase/server/auth"
import { createClient } from "@/app/supabase/services/server"
import { revalidatePath } from "next/cache"
import { EditPageForm } from "./EditPageForm"
import type { PageSectionWidth } from "@/lib/supabase/server/sections"
import type { Json, Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/types"

interface PageProps {
  params: Promise<{ id: string }>
}

type PageRow = Tables<"pages">
type PageInsert = TablesInsert<"pages">
type PageUpdate = TablesUpdate<"pages">

type PageHeroFields = {
  hero_image_enabled?: boolean
  hero_image_url?: string | null
  hero_image_alt?: string | null
  hero_constrain_to_container?: boolean
}

type PageRowWithHero = PageRow & PageHeroFields

type PageSectionRow = Tables<"page_sections">
type PageSectionInsert = TablesInsert<"page_sections">
type PageSectionUpdate = TablesUpdate<"page_sections">

async function getPageById(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .eq("author_id", user.id)
    .maybeSingle()

  if (error) {
    return null
  }

  return page
}

async function getSectionsByPageId(pageId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("page_sections")
    .select("id, page_id, title, icon, width, column_span, order_index, content, created_at, updated_at")
    .eq("page_id", pageId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching page sections:", error)
    return []
  }

  return data || []
}

function revalidatePageSlug(slug: string) {
  // Dynamic route
  revalidatePath(`/${slug}`)
  // Home is rendered at '/'
  if (slug === "home") revalidatePath("/")
}

async function createPage(data: {
  title: string
  slug: string
  summary?: string
  content?: Json
  render_mode?: "whole" | "sections"
  is_published?: boolean
  hero_image_enabled?: boolean
  hero_image_url?: string
  hero_image_alt?: string
  hero_constrain_to_container?: boolean
}) {
  "use server"

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Unauthorized" }
  }

  const isPublished = data.is_published ?? false
  const heroEnabled = data.hero_image_enabled ?? false
  const heroUrl = (data.hero_image_url ?? "").trim() || null
  const heroAlt = (data.hero_image_alt ?? "").trim() || null
  const heroConstrain = data.hero_constrain_to_container ?? true

  if (heroEnabled && !heroUrl) {
    return { error: "Hero image URL is required when hero image is enabled" }
  }

  const pageData: PageInsert = {
    title: data.title,
    slug: data.slug,
    summary: data.summary ?? null,
    content: (data.content ?? {}) as Json,
    render_mode: data.render_mode ?? "whole",
    author_id: user.id,
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
  }

  ;(pageData as any).hero_image_enabled = heroEnabled
  ;(pageData as any).hero_image_url = heroUrl
  ;(pageData as any).hero_image_alt = heroAlt
  ;(pageData as any).hero_constrain_to_container = heroConstrain

  const { data: page, error } = await supabase
    .from("pages")
    .insert(pageData)
    .select("id, slug")
    .single()

  if (error) {
    console.error("Error creating page:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/pages")
  revalidatePageSlug(page.slug)

  return { data: page }
}

async function updatePage(id: string, data: {
  title?: string
  slug?: string
  summary?: string
  content?: Json
  render_mode?: "whole" | "sections"
  is_published?: boolean
  hero_image_enabled?: boolean
  hero_image_url?: string
  hero_image_alt?: string
  hero_constrain_to_container?: boolean
}) {
  "use server"

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Unauthorized" }
  }

  // Verify ownership
  const { data: existingPage } = await supabase
    .from("pages")
    .select("author_id, slug, published_at")
    .eq("id", id)
    .single()

  if (!existingPage || existingPage.author_id !== user.id) {
    return { error: "Unauthorized" }
  }

  const updateData: Omit<PageUpdate, "id" | "author_id" | "created_at" | "updated_at"> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.slug !== undefined) updateData.slug = data.slug
  if (data.summary !== undefined) updateData.summary = data.summary ?? null
  if (data.content !== undefined) updateData.content = data.content
  if (data.render_mode !== undefined) updateData.render_mode = data.render_mode

  if (data.hero_image_enabled !== undefined) {
    ;(updateData as any).hero_image_enabled = data.hero_image_enabled
  }
  if (data.hero_image_url !== undefined) {
    const url = data.hero_image_url.trim() || null
    ;(updateData as any).hero_image_url = url
    if ((data.hero_image_enabled ?? (updateData as any).hero_image_enabled) === true && !url) {
      return { error: "Hero image URL is required when hero image is enabled" }
    }
  }
  if (data.hero_image_alt !== undefined) {
    ;(updateData as any).hero_image_alt = data.hero_image_alt.trim() || null
  }
  if (data.hero_constrain_to_container !== undefined) {
    ;(updateData as any).hero_constrain_to_container = data.hero_constrain_to_container
  }

  if (data.is_published !== undefined) {
    updateData.is_published = data.is_published
    if (data.is_published && !existingPage.published_at) {
      updateData.published_at = new Date().toISOString()
    } else if (!data.is_published) {
      updateData.published_at = null
    }
  }

  const { data: page, error } = await supabase
    .from("pages")
    .update(updateData)
    .eq("id", id)
    .select("id, slug")
    .single()

  if (error) {
    console.error("Error updating page:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/pages")
  revalidatePageSlug(existingPage.slug)
  if (data.slug && data.slug !== existingPage.slug) revalidatePageSlug(data.slug)

  return { data: page }
}

async function createPageSection(data: {
  page_id: string
  title?: string | null
  icon?: string | null
  width?: PageSectionWidth
  column_span?: number | null
  order_index?: number
  content?: Json
}) {
  "use server"

  const supabase = await createClient()

  const { data: inserted, error } = await supabase
    .from("page_sections")
    .insert({
      page_id: data.page_id,
      title: data.title ?? null,
      icon: data.icon ?? null,
      width: data.width ?? "full",
      column_span: data.width === "partial" ? (data.column_span ?? 6) : null,
      order_index: data.order_index ?? 0,
      content: (data.content ?? {}) as Json,
    } satisfies PageSectionInsert)
    .select("id, page_id")
    .single()

  if (error) {
    console.error("Error creating page section:", error)
    return { error: error.message }
  }

  // Revalidate page routes
  const { data: page } = await supabase.from("pages").select("slug").eq("id", inserted.page_id).maybeSingle()
  if (page?.slug) revalidatePageSlug(page.slug)

  return { data: inserted }
}

async function updatePageSection(id: string, data: {
  title?: string | null
  icon?: string | null
  width?: PageSectionWidth
  column_span?: number | null
  order_index?: number
  content?: Json
}) {
  "use server"

  const supabase = await createClient()

  const updateData: Omit<PageSectionUpdate, "id" | "page_id" | "created_at" | "updated_at"> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.icon !== undefined) updateData.icon = data.icon
  if (data.width !== undefined) updateData.width = data.width
  if (data.width === "full") updateData.column_span = null
  if (data.width === "partial" && data.column_span !== undefined) updateData.column_span = data.column_span
  if (data.order_index !== undefined) updateData.order_index = data.order_index
  if (data.content !== undefined) updateData.content = data.content

  const { data: updated, error } = await supabase
    .from("page_sections")
    .update(updateData)
    .eq("id", id)
    .select("id, page_id")
    .single()

  if (error) {
    console.error("Error updating page section:", error)
    return { error: error.message }
  }

  const { data: page } = await supabase.from("pages").select("slug").eq("id", updated.page_id).maybeSingle()
  if (page?.slug) revalidatePageSlug(page.slug)

  return { data: updated }
}

async function deletePageSection(
  id: string,
): Promise<{ success?: true; error?: string }> {
  "use server"

  const supabase = await createClient()

  const { data: existing } = await supabase.from("page_sections").select("page_id").eq("id", id).maybeSingle()

  const { error } = await supabase.from("page_sections").delete().eq("id", id)

  if (error) {
    console.error("Error deleting page section:", error)
    return { error: error.message }
  }

  if (existing?.page_id) {
    const { data: page } = await supabase.from("pages").select("slug").eq("id", existing.page_id).maybeSingle()
    if (page?.slug) revalidatePageSlug(page.slug)
  }

  return { success: true as const }
}

export default async function EditPagePage({ params }: PageProps) {
  await requireAuth("/admin/pages")
  const { id } = await params
  const isNew = id === "new"

  let page: PageRowWithHero | null = null
  let sections: PageSectionRow[] = []
  if (!isNew) {
    page = (await getPageById(id)) as PageRowWithHero | null
    if (!page) {
      notFound()
    }
    if (page.render_mode === "sections") {
      sections = await getSectionsByPageId(page.id)
    }
  }

  return (
    <EditPageForm
      page={page}
      sections={sections}
      isNew={isNew}
      createPage={createPage}
      updatePage={updatePage}
      createSection={createPageSection}
      updateSection={updatePageSection}
      deleteSection={deletePageSection}
    />
  )
}
