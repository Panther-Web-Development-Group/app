import { createClient } from "@/app/supabase/services/server"

export type PageRenderMode = "whole" | "sections"
export type PageSectionWidth = "full" | "partial"

export type PageSection = {
  id: string
  page_id: string
  title: string | null
  icon: string | null
  width: PageSectionWidth
  column_span: number | null
  order_index: number
  content: any
  created_at: string
  updated_at: string
}

export async function getPageSectionsByPageId(pageId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("page_sections")
    .select(
      "id, page_id, title, icon, width, column_span, order_index, content, created_at, updated_at",
    )
    .eq("page_id", pageId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching page sections:", error)
    return null
  }

  return data as PageSection[]
}

