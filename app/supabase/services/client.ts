"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/types"

/**
 * Create a Supabase client for use in Client Components
 * This automatically handles cookies for authentication
 */
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_OR_PUBLISHABLE_KEY!,
  )
}