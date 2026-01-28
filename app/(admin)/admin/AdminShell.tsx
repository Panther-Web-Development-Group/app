"use client"

import Link from "next/link"
import { useState, type ReactNode } from "react"
import { Menu, X, LogOut, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/cn"
import { AdminNav } from "../AdminNav"
import { DashboardSearchbar } from "./DashboardSearchbar"
import { Button } from "@/app/components/Button"

export default function AdminShell({
  title,
  logoutAction,
  children,
}: {
  title: string
  logoutAction: () => void | Promise<void>
  children: ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground md:flex">
      {/* Mobile overlay */}
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72",
          "bg-secondary text-secondary-foreground",
          "transition-transform duration-300 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:static md:translate-x-0 md:inset-auto md:z-auto",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 px-4 py-4">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-(--pw-border) bg-accent/20 text-secondary-foreground font-semibold">
                PW
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">PantherWeb</div>
                <div className="text-xs text-secondary-foreground/70">Dashboard</div>
              </div>
            </Link>
            <Button
              type="button"
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent/15"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              variant="icon"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            <AdminNav onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen overflow-x-hidden flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-secondary backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button
              type="button"
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent/20"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              variant="icon"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden sm:block">
                <DashboardSearchbar />
              </div>

              <Link
                href="/"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm font-semibold text-foreground transition-colors hover:bg-background/20"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to site</span>
              </Link>

              <form action={logoutAction}>
                <Button
                  type="submit"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
                  variant="ghost"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Log out</span>
                </Button>
              </form>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

