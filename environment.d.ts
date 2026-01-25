declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_OR_PUBLISHABLE_KEY: string
      NEXT_SUPABASE_ADMIN_KEY: string
    }
  }
}

export {}