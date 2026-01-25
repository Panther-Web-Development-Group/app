import { getPages, getPosts, getNavigationItems } from "@/lib/supabase/server"
import Link from "next/link"
import { FileText, Newspaper, Navigation } from "lucide-react"

export default async function AdminDashboard() {
  // Fetch stats
  const [pages, posts, navigationItems] = await Promise.all([
    getPages({ publishedOnly: false, limit: 1000 }),
    getPosts({ publishedOnly: false, limit: 1000 }),
    getNavigationItems(),
  ])

  const publishedPages = pages?.filter((p) => p.is_published).length || 0
  const draftPages = (pages?.length || 0) - publishedPages
  const publishedPosts = posts?.filter((p) => p.is_published).length || 0
  const draftPosts = (posts?.length || 0) - publishedPosts
  const activeNavItems = navigationItems?.length || 0

  const stats = [
    {
      name: "Total Pages",
      value: pages?.length || 0,
      published: publishedPages,
      draft: draftPages,
      icon: FileText,
      href: "/admin/pages",
      color: "bg-info",
    },
    {
      name: "Total Posts",
      value: posts?.length || 0,
      published: publishedPosts,
      draft: draftPosts,
      icon: Newspaper,
      href: "/admin/posts",
      color: "bg-success",
    },
    {
      name: "Navigation Items",
      value: activeNavItems,
      published: activeNavItems,
      draft: 0,
      icon: Navigation,
      href: "/admin/navigation",
      color: "bg-accent",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground">
          Dashboard Overview
        </h2>
        <p className="mt-2 text-foreground/75">
          Quick overview of your content
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="group relative overflow-hidden rounded-lg border border-(--pw-border) bg-secondary/20 p-6 transition-all hover:bg-secondary/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/75">
                    {stat.name}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <div className="mt-2 flex gap-4 text-xs text-foreground/70">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-success"></span>
                      {stat.published} published
                    </span>
                    {stat.draft > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-warning"></span>
                        {stat.draft} draft
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={`${stat.color} rounded-lg p-3 text-accent-foreground opacity-80 transition-opacity group-hover:opacity-100`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-foreground">
          Quick Actions
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/pages/new"
            className="rounded-lg border border-(--pw-border) bg-background/10 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-background/20"
          >
            + Create New Page
          </Link>
          <Link
            href="/admin/posts/new"
            className="rounded-lg border border-(--pw-border) bg-background/10 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-background/20"
          >
            + Create New Post
          </Link>
          <Link
            href="/admin/navigation?new=true"
            className="rounded-lg border border-(--pw-border) bg-background/10 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-background/20"
          >
            + Add Navigation Item
          </Link>
        </div>
      </div>
    </div>
  )
}
