/**
 * Utility to check if required environment variables are set
 * Use this in development to catch missing env vars early
 */

export function checkEnvVars() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_OR_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ADMIN_KEY",
  ] as const

  const missing: string[] = []
  const values: Record<string, string | undefined> = {}

  required.forEach((key) => {
    const value = process.env[key]
    values[key] = value
    if (!value) {
      missing.push(key)
    }
  })

  return {
    allSet: missing.length === 0,
    missing,
    values,
  }
}

// Log env var status in development
if (process.env.NODE_ENV === "development") {
  const { allSet, missing, values } = checkEnvVars()
  
  if (allSet) {
    console.log("✅ All environment variables are set")
    console.log("Environment variables:", {
      NEXT_PUBLIC_SUPABASE_URL: values.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
      NEXT_PUBLIC_SUPABASE_ANON_OR_PUBLISHABLE_KEY: values.NEXT_PUBLIC_SUPABASE_ANON_OR_PUBLISHABLE_KEY?.substring(0, 20) + "...",
      NEXT_PUBLIC_SUPABASE_ADMIN_KEY: values.NEXT_PUBLIC_SUPABASE_ADMIN_KEY ? "***set***" : undefined,
    })
  } else {
    console.error("❌ Missing environment variables:", missing)
    console.error("Please check your .env or .env.local file")
  }
}
