import { createClient } from "@/app/supabase/services/server"
import type { NavigationItem } from "./types"

export async function getNavigationItems(): Promise<NavigationItem[]> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("navigation_items")
      .select("id, label, href, icon, image, target, order_index")
      .eq("is_active", true) // Only get active items
      .is("parent_id", null) // Only get top-level items for sidebar
      .order("order_index", { ascending: true })

    if (error) {
      console.error("Error fetching navigation items:", error)
      return []
    }

    if (!data || data.length === 0) {
      console.warn("No active navigation items found")
      return []
    }

    return data.map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      icon: item.icon ? (
        <span className="text-zinc-500 dark:text-zinc-400">{item.icon}</span>
      ) : undefined,
      image: item.image,
      target: item.target || "_self",
      order_index: item.order_index || 0,
    }))
  } catch (error) {
    console.error("Error fetching navigation items:", error)
    return []
  }
}
