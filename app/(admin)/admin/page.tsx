import { getPages, getPosts, getNavigationItems } from "@/lib/supabase/server"
import { createClient } from "@/app/supabase/services/server"
import { getCurrentUser } from "@/lib/supabase/server"
import Link from "next/link"
import {
  FileText,
  Newspaper,
  Navigation,
  Folder,
  Tags,
  Calendar,
  Vote,
  FileText as QuizIcon,
  Plus,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/cn"

export default async function AdminDashboard() {
  const user = await getCurrentUser()
  const supabase = await createClient()

  // Fetch stats
  const [
    pages,
    posts,
    navigationItems,
    categoriesResult,
    tagsResult,
    eventsResult,
    pollsResult,
    quizzesResult,
  ] = await Promise.all([
    getPages({ publishedOnly: false, limit: 1000 }),
    getPosts({ publishedOnly: false, limit: 1000 }),
    getNavigationItems(),
    user
      ? supabase
          .from("categories")
          .select("id, is_active")
          .eq("owner_id", user.id)
      : { data: [] },
    user
      ? supabase
          .from("tags")
          .select("id, is_active")
          .eq("owner_id", user.id)
      : { data: [] },
    user
      ? supabase
          .from("events")
          .select("id, is_published")
          .eq("owner_id", user.id)
      : { data: [] },
    user
      ? supabase
          .from("polls")
          .select("id, is_published")
          .eq("author_id", user.id)
      : { data: [] },
    user
      ? supabase
          .from("quizzes")
          .select("id, is_published")
          .eq("author_id", user.id)
      : { data: [] },
  ])

  const publishedPages = pages?.filter((p) => p.is_published).length || 0
  const draftPages = (pages?.length || 0) - publishedPages
  const publishedPosts = posts?.filter((p) => p.is_published).length || 0
  const draftPosts = (posts?.length || 0) - publishedPosts
  const activeNavItems = navigationItems?.length || 0
  const activeCategories = categoriesResult.data?.filter((c) => c.is_active).length || 0
  const totalCategories = categoriesResult.data?.length || 0
  const activeTags = tagsResult.data?.filter((t) => t.is_active).length || 0
  const totalTags = tagsResult.data?.length || 0
  const publishedEvents = eventsResult.data?.filter((e) => e.is_published).length || 0
  const totalEvents = eventsResult.data?.length || 0
  const publishedPolls = pollsResult.data?.filter((p) => p.is_published).length || 0
  const totalPolls = pollsResult.data?.length || 0
  const publishedQuizzes = quizzesResult.data?.filter((q) => q.is_published).length || 0
  const totalQuizzes = quizzesResult.data?.length || 0

  const stats = [
    {
      name: "Pages",
      value: pages?.length || 0,
      published: publishedPages,
      draft: draftPages,
      icon: FileText,
      href: "/admin/pages",
      color: "bg-info/20 text-info",
    },
    {
      name: "Posts",
      value: posts?.length || 0,
      published: publishedPosts,
      draft: draftPosts,
      icon: Newspaper,
      href: "/admin/posts",
      color: "bg-success/20 text-success",
    },
    {
      name: "Categories",
      value: totalCategories,
      published: activeCategories,
      draft: totalCategories - activeCategories,
      icon: Folder,
      href: "/admin/categories",
      color: "bg-accent/20 text-accent-foreground",
    },
    {
      name: "Tags",
      value: totalTags,
      published: activeTags,
      draft: totalTags - activeTags,
      icon: Tags,
      href: "/admin/tags",
      color: "bg-warning/20 text-warning",
    },
    {
      name: "Events",
      value: totalEvents,
      published: publishedEvents,
      draft: totalEvents - publishedEvents,
      icon: Calendar,
      href: "/admin/events",
      color: "bg-info/20 text-info",
    },
    {
      name: "Polls",
      value: totalPolls,
      published: publishedPolls,
      draft: totalPolls - publishedPolls,
      icon: Vote,
      href: "/admin/polls",
      color: "bg-success/20 text-success",
    },
    {
      name: "Quizzes",
      value: totalQuizzes,
      published: publishedQuizzes,
      draft: totalQuizzes - publishedQuizzes,
      icon: QuizIcon,
      href: "/admin/quizzes",
      color: "bg-accent/20 text-accent-foreground",
    },
    {
      name: "Navigation",
      value: activeNavItems,
      published: activeNavItems,
      draft: 0,
      icon: Navigation,
      href: "/admin/navigation",
      color: "bg-info/20 text-info",
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="group relative overflow-hidden rounded-lg border border-(--pw-border) bg-secondary/20 p-5 transition-all hover:bg-secondary/30 hover:shadow-[0_10px_30px_var(--pw-shadow)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
                    {stat.name}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-foreground/70">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_color-mix(in_oklab,var(--pw-success)_40%,transparent)]"></span>
                      <span className="font-medium">{stat.published}</span>
                      <span className="text-foreground/60">active</span>
                    </span>
                    {stat.draft > 0 && (
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-warning shadow-[0_0_8px_color-mix(in_oklab,var(--pw-warning)_40%,transparent)]"></span>
                        <span className="font-medium">{stat.draft}</span>
                        <span className="text-foreground/60">draft</span>
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={cn(
                    "ml-3 shrink-0 rounded-lg p-2.5 transition-all group-hover:scale-110",
                    stat.color
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
          <Link
            href="/admin/site-settings"
            className="text-xs font-medium text-foreground/70 hover:text-foreground transition-colors flex items-center gap-1"
          >
            Settings
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/pages/new"
            className="group flex items-center gap-3 rounded-lg border border-(--pw-border) bg-background/10 px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-background/20 hover:shadow-[0_10px_30px_var(--pw-shadow)]"
          >
            <Plus className="h-4 w-4 text-foreground/70 group-hover:text-foreground transition-colors" />
            <span>New Page</span>
          </Link>
          <Link
            href="/admin/posts/new"
            className="group flex items-center gap-3 rounded-lg border border-(--pw-border) bg-background/10 px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-background/20 hover:shadow-[0_10px_30px_var(--pw-shadow)]"
          >
            <Plus className="h-4 w-4 text-foreground/70 group-hover:text-foreground transition-colors" />
            <span>New Post</span>
          </Link>
          <Link
            href="/admin/events"
            className="group flex items-center gap-3 rounded-lg border border-(--pw-border) bg-background/10 px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-background/20 hover:shadow-[0_10px_30px_var(--pw-shadow)]"
          >
            <Plus className="h-4 w-4 text-foreground/70 group-hover:text-foreground transition-colors" />
            <span>New Event</span>
          </Link>
          <Link
            href="/admin/navigation/new"
            className="group flex items-center gap-3 rounded-lg border border-(--pw-border) bg-background/10 px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-background/20 hover:shadow-[0_10px_30px_var(--pw-shadow)]"
          >
            <Plus className="h-4 w-4 text-foreground/70 group-hover:text-foreground transition-colors" />
            <span>Navigation</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
