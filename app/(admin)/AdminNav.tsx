"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  FileText,
  Folder,
  Images,
  LayoutDashboard,
  MessageSquare,
  Navigation,
  Newspaper,
  Settings,
  Tags,
  Vote,
} from "lucide-react"
import { cn } from "@/lib/cn"

type AdminNavProps = {
  onNavigate?: () => void
}

const navGroups = [
  {
    title: "Dashboard",
    items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard }],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/pages", label: "Pages", icon: FileText },
      { href: "/admin/posts", label: "Posts", icon: Newspaper },
      { href: "/admin/categories", label: "Categories", icon: Folder },
      { href: "/admin/tags", label: "Tags", icon: Tags },
    ],
  },
  {
    title: "Community",
    items: [
      { href: "/admin/comments", label: "Comments", icon: MessageSquare },
      { href: "/admin/events", label: "Events", icon: Calendar },
      { href: "/admin/polls", label: "Polls", icon: Vote },
      { href: "/admin/quizzes", label: "Quizzes", icon: FileText },
    ],
  },
  {
    title: "Site",
    items: [
      { href: "/admin/navigation", label: "Navigation", icon: Navigation },
      { href: "/admin/media", label: "Media", icon: Images },
      { href: "/admin/files", label: "Files", icon: FileText },
      { href: "/admin/galleries", label: "Galleries", icon: Folder },
      { href: "/admin/slideshows", label: "Slideshows", icon: LayoutDashboard },
      { href: "/admin/site-settings", label: "Site Settings", icon: Settings },
    ],
  },
]

export function AdminNav({ onNavigate }: AdminNavProps) {
  const pathname = usePathname()

  return (
    <nav className="space-y-6">
      {navGroups.map((group) => (
        <div key={group.title} className="space-y-2">
          <div className="px-3 text-xs font-semibold uppercase tracking-wider text-secondary-foreground/60">
            {group.title}
          </div>
          <div className="space-y-1">
            {group.items.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname?.startsWith(item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-accent/20 text-secondary-foreground"
                      : "text-secondary-foreground/85 hover:bg-accent/15 hover:text-secondary-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
