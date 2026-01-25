import { Header } from "./index"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/app/supabase/services/server"
import { HeaderSearchbar } from "./Searchbar"
import { Button } from "@/app/components/Button"

/**
 * Server component version of Header
 * Simple header with logo and sidebar toggle (no navigation bar)
 */
export async function HeaderServer() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  async function logout() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  const href = user ? "/admin" : "/login"
  const label = user ? "Dashboard" : "Login"

  return (
    <Header>
      <HeaderSearchbar />
      <Link
        href={href}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-3 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
      >
        {label}
      </Link>
      {user ? (
        <form action={logout}>
          <Button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm font-semibold text-foreground transition-colors hover:bg-background/20"
          >
            Log out
          </Button>
        </form>
      ) : null}
    </Header>
  )
}
