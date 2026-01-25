import { getPosts } from "@/lib/supabase/server"
import Link from "next/link"
import { Plus, Edit, Eye, EyeOff } from "lucide-react"

export default async function AdminPosts() {
  const posts = await getPosts({ publishedOnly: false, limit: 100 })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Posts
          </h2>
          <p className="mt-2 text-foreground/75">
            Manage your blog posts
          </p>
        </div>
        <Link
          href="/admin/posts?new=true"
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="rounded-lg border border-(--pw-border) bg-secondary/20 p-12 text-center">
          <p className="text-foreground/75">No posts found.</p>
          <Link
            href="/admin/posts/new"
            className="mt-4 inline-block text-sm font-semibold text-foreground underline"
          >
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-(--pw-border) bg-secondary/20">
          <table className="min-w-full divide-y divide-(--pw-border)">
            <thead className="bg-secondary/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Published
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--pw-border)">
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="transition-colors hover:bg-secondary/30"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-semibold text-foreground">
                      {post.title}
                    </div>
                    {post.excerpt && (
                      <div className="mt-1 text-xs text-foreground/70">
                        {post.excerpt.substring(0, 60)}...
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <code className="rounded border border-(--pw-border) bg-background/10 px-2 py-1 text-xs text-foreground/85">
                      /{post.slug}
                    </code>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {post.is_published ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        <Eye className="h-3 w-3" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        <EyeOff className="h-3 w-3" />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground/70">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="text-foreground/75 hover:text-foreground"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
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
