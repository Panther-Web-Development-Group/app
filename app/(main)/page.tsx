import Link from "next/link"
import { LexicalRenderer } from "@/app/components/LexicalRenderer"
import { PageSectionsRenderer } from "@/app/components/PageSections"
import { getPageBySlug, getPages, getPageSectionsByPageId } from "@/lib/supabase/server"
import { cn } from "@/lib/cn"

export const runtime = "nodejs"

export default async function Home() {
  const homePage = await getPageBySlug("home")
  const [homeSections, latestPagesRaw] = await Promise.all([
    homePage?.render_mode === "sections" ? getPageSectionsByPageId(homePage.id) : Promise.resolve(null),
    getPages({ publishedOnly: true, orderBy: "updated_at", order: "desc", limit: 12 }),
  ])

  const latestPages = (latestPagesRaw || []).filter((p) => p.slug !== "home").slice(0, 6)
  const heroUrl = homePage?.hero_image_enabled ? homePage.hero_image_url : null
  const heroAlt = homePage?.hero_image_alt || homePage?.title || "Welcome"

  return (
    <div className="space-y-10">
      <section className="snap-start scroll-mt-24 overflow-hidden rounded-2xl border border-(--pw-border) bg-secondary/20">
        <div className="relative overflow-hidden">
          {heroUrl ? (
            <>
              <img
                src={heroUrl}
                alt={heroAlt}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/25 to-black/70" />
            </>
          ) : null}

          <div
            className={cn(
              "relative z-10 px-6 py-10 sm:px-10",
              heroUrl ? "text-white" : "bg-linear-to-br from-secondary/60 to-background/20 text-foreground",
            )}
          >
            <h1 className={cn("text-[2em] font-bold tracking-tight sm:text-[2.5em]", heroUrl ? "text-white" : "text-foreground")}>
              {homePage?.title || "Welcome"}
            </h1>
            <p className={cn("mt-3 max-w-2xl text-[1.5em] leading-snug", heroUrl ? "text-white/90" : "text-foreground/80")}>
              {homePage?.summary ||
                "This site is powered by your CMS. Publish pages from the admin dashboard and they’ll appear here."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
              >
                Admin dashboard
              </Link>
              <Link
                href="/login"
                className={cn(
                  "inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition-colors",
                  heroUrl
                    ? "border-white/30 bg-black/15 text-white hover:bg-black/25"
                    : "border-(--pw-border) bg-background/10 text-foreground hover:bg-background/20",
                )}
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {homePage?.render_mode === "sections" ? (
        <section className="snap-start scroll-mt-24">
          <PageSectionsRenderer sections={homeSections || []} />
        </section>
      ) : homePage?.content ? (
        <section className="snap-start scroll-mt-24">
          <LexicalRenderer
            content={homePage.content}
            className="prose prose-zinc dark:prose-invert max-w-none"
          />
        </section>
      ) : null}

      <section className="snap-start scroll-mt-24 space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Latest pages
            </h2>
            <p className="mt-1 text-sm text-foreground/75">
              Recently updated published pages.
            </p>
          </div>
          <Link
            href="/admin/pages"
            className="text-sm font-semibold text-foreground/85 hover:text-foreground"
          >
            Manage pages
          </Link>
        </div>

        {!latestPages || latestPages.length === 0 ? (
          <div className="rounded-xl border border-(--pw-border) bg-secondary/20 p-6 text-sm text-foreground/75">
            No published pages yet. Create one in{" "}
            <Link href="/admin/pages" className="font-medium underline">
              Admin → Pages
            </Link>
            .
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestPages.map((p) => (
              <Link
                key={p.id}
                href={`/${p.slug}`}
                className="group rounded-xl border border-(--pw-border) bg-secondary/20 p-5 transition-colors hover:bg-secondary/30"
              >
                <div className="text-sm font-semibold text-foreground">
                  {p.title}
                </div>
                {p.summary ? (
                  <div className="mt-2 line-clamp-3 text-sm text-foreground/75">
                    {p.summary}
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-foreground/70">
                    /{p.slug}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

