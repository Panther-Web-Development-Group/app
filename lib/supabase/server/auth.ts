import { createClient } from "@/app/supabase/services/server"
import { redirect } from "next/navigation"

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export const getCurrentUser = async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use this in Server Components that need authentication
 */
export const requireAuth = async (redirectTo?: string) => {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo || "/admin")}`)
  }
  
  return user
}
