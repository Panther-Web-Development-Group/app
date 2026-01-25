// This file is kept for reference/utilities
// The actual middleware should be at the root level: middleware.ts
// 
// If you need to reuse middleware logic, export helper functions here
// and import them in the root middleware.ts

import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // Refresh auth session
  await supabase.auth.getUser()

  return { supabase, response }
}