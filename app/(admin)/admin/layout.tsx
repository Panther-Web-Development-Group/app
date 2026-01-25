import type { Metadata } from "next"
import { redirect } from "next/navigation"
import AdminShell from "./AdminShell"
import { createClient } from "@/app/supabase/services/server"
import { requireAuth } from "@/lib/supabase/server/auth"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Content management dashboard",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  async function logout() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/login")
  }

  // Guard all admin routes (primary gate)
  await requireAuth("/admin")

  return (
    <AdminShell title="Admin Dashboard" logoutAction={logout}>
      {children}
    </AdminShell>
  )
}
