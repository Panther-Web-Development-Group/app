import { getPages } from "@/lib/supabase/server"
import Link from "next/link"
import { Plus, Edit, Eye, EyeOff, ExternalLink } from "lucide-react"

export default async function AdminPages() {
  const pages = await getPages({ publishedOnly: false, limit: 100 })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Pages
          </h1>
          <p className="mt-2 text-foreground/75">
            Manage your site pages
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--pw-ring)"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New Page
        </Link>
      </div>

      {!pages || pages.length === 0 ? (
        <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-12 text-center">
          <p className="text-foreground/75">No pages found.</p>
          <Link
            href="/admin/pages/new"
            className="mt-4 inline-block text-sm font-semibold text-foreground underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--pw-ring)"
          >
            Create your first page
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-(--pw-border) bg-secondary/20">
          <table className="min-w-full divide-y divide-(--pw-border)" role="grid">
            <thead className="bg-secondary/30">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Slug
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Updated
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--pw-border)">
              {pages.map((page) => (
                <tr
                  key={page.id}
                  className="transition-colors hover:bg-secondary/30"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-semibold text-foreground">
                      {page.title}
                    </div>
                    {page.summary != null && page.summary !== "" && (
                      <div className="mt-1 max-w-md truncate text-xs text-foreground/70">
                        {page.summary.length > 60 ? `${page.summary.slice(0, 60)}…` : page.summary}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <code className="rounded border border-(--pw-border) bg-background/10 px-2 py-1 text-xs text-foreground/85">
                      /{page.slug}
                    </code>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {page.is_published ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        <Eye className="h-3 w-3" aria-hidden />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        <EyeOff className="h-3 w-3" aria-hidden />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground/70">
                    {new Date(page.updated_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <span className="inline-flex items-center gap-3">
                      {page.is_published && (
                        <Link
                          href={page.slug === "home" ? "/" : `/${page.slug}`}
                          className="inline-flex items-center gap-1.5 text-foreground/75 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--pw-ring)"
                          aria-label={`View ${page.title}`}
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden />
                          <span className="sr-only sm:not-sr-only sm:inline">View</span>
                        </Link>
                      )}
                      <Link
                        href={`/admin/pages/${page.id}`}
                        className="inline-flex items-center gap-1.5 text-foreground/75 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--pw-ring)"
                        aria-label={`Edit ${page.title}`}
                      >
                        <Edit className="h-4 w-4" aria-hidden />
                        <span className="sr-only sm:not-sr-only sm:inline">Edit</span>
                      </Link>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
