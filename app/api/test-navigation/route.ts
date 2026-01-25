import { NextResponse } from "next/server"
import { createClient } from "@/app/supabase/services/server"

/**
 * API route to test getNavigationItems function
 * GET /api/test-navigation
 * Returns navigation items from the database
 * 
 * This tests the database query directly (without ReactNode conversion)
 * to verify the data fetching works correctly
 */
export const runtime = "nodejs"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // First, check if table exists and get all items (no filters) for diagnostics
    const { data: allData, error: allError } = await supabase
      .from("navigation_items")
      .select("id, label, href, icon, image, target, is_active, order_index, parent_id")
      .order("order_index", { ascending: true })

    if (allError) {
      console.error("Error fetching all navigation items:", allError)
      return NextResponse.json(
        {
          status: "error",
          message: "Database query failed",
          error: allError.message,
          code: allError.code,
          details: allError.details,
        },
        { status: 500 }
      )
    }

    // Now get filtered items (active, top-level only)
    const { data, error } = await supabase
      .from("navigation_items")
      .select("id, label, href, icon, image, target, is_active, order_index, parent_id")
      .eq("is_active", true)
      .is("parent_id", null) // Only get top-level items
      .order("order_index", { ascending: true })

    if (error) {
      console.error("Error fetching filtered navigation items:", error)
      return NextResponse.json(
        {
          status: "error",
          message: "Database query failed",
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: 500 }
      )
    }

    // Diagnostic information
    const diagnostics = {
      total_items_in_table: allData?.length || 0,
      active_items: allData?.filter(item => item.is_active === true).length || 0,
      inactive_items: allData?.filter(item => item.is_active === false).length || 0,
      null_active_items: allData?.filter(item => item.is_active === null || item.is_active === undefined).length || 0,
      top_level_items: allData?.filter(item => item.parent_id === null).length || 0,
      active_top_level_items: data?.length || 0,
      sample_items: allData?.slice(0, 3).map(item => ({
        id: item.id,
        label: item.label,
        is_active: item.is_active,
        parent_id: item.parent_id,
      })) || [],
    }

    return NextResponse.json({
      status: data && data.length > 0 ? "success" : "warning",
      count: data?.length || 0,
      items: data || [],
      message: data && data.length > 0 
        ? `Successfully fetched ${data.length} navigation items`
        : `No items found matching filters. See diagnostics below.`,
      query: {
        table: "navigation_items",
        filters: {
          is_active: true,
          parent_id: "null (top-level only)",
        },
        order: "order_index ASC",
      },
      diagnostics,
    })
  } catch (error) {
    console.error("Error in test-navigation route:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch navigation items",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
