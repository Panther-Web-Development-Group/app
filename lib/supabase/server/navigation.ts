import { createClient } from "@/app/supabase/services/server"

/**
 * Get top-level navigation items only
 */
export const getNavigationItems = async () => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("navigation_items")
    .select("*")
    .eq("is_active", true) // Only get active items
    .is("parent_id", null) // Only get top-level items
    .order("order_index", { ascending: true })

  if (error) {
    console.error("Error fetching navigation items:", error)
    return null
  }
  
  return data
}

/**
 * Get navigation items with their children (submenus)
 * Returns a tree structure of navigation items
 */
export const getNavigationTree = async () => {
  const supabase = await createClient()

  // Get all active navigation items
  const { data, error } = await supabase
    .from("navigation_items")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true })

  if (error) {
    console.error("Error fetching navigation items:", error)
    return null
  }

  if (!data) return null

  // Build tree structure
  const itemsMap = new Map<string, any>()
  const rootItems: any[] = []

  // First pass: create map of all items
  data.forEach((item) => {
    itemsMap.set(item.id, { ...item, children: [] })
  })

  // Second pass: build tree
  for (const item of data) {
    const node = itemsMap.get(item.id)!
    if (!node) continue

    if (item.parent_id) {
      const parent = itemsMap.get(item.parent_id)
      if (parent) parent.children.push(node)
    } else rootItems.push(node)
  }

  // Sort children by order_index
  const sortChildren = (items: any[]) => {
    items.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    for (const item of items) {
      if (item.children && item.children.length > 0) sortChildren(item.children)
    }
  }

  sortChildren(rootItems)

  return rootItems
}
