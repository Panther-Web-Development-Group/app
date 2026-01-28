import { notFound } from "next/navigation"
import { getPageBySlug, getPageSectionsByPageId } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { LexicalRenderer } from "@/app/components/LexicalRenderer"
import { PageSectionsRenderer } from "@/app/components/PageSections"
import { cn } from "@/lib/cn"

// Ensure this is a Server Component
export const runtime = "nodejs"

/**
 * Sanitizes HTML content by removing document-level tags (html, head, body)
 * that would cause hydration errors when rendered inside a div
 */
function sanitizeHtml(html: string): string {
  if (!html) return ""
  
  let sanitized = html
  
  // Remove <html> and </html> tags (case-insensitive, with attributes)
  sanitized = sanitized.replace(/<html[^>]*>/gi, "")
  sanitized = sanitized.replace(/<\/html>/gi, "")
  
  // Remove <head> and </head> tags and their content
  sanitized = sanitized.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
  
  // Remove <body> and </body> tags but keep the content
  sanitized = sanitized.replace(/<body[^>]*>/gi, "")
  sanitized = sanitized.replace(/<\/body>/gi, "")
  
  return sanitized.trim()
}

/**
 * Checks if content is in Lexical JSON format
 */
function isLexicalFormat(content: any): boolean {
  if (!content || typeof content !== "object") return false
  // Lexical format has a root property
  if (content.root && typeof content.root === "object") return true
  // Or it might be a string that parses to Lexical JSON
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content)
      return parsed && typeof parsed === "object" && parsed.root
    } catch {
      return false
    }
  }
  return false
}

interface PageProps {
  params: Promise<{ page: string }>
}

/**
 * Generate metadata for the page
 * This runs in a Server Component context and can use server-only APIs
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { page: slug } = await params
    const page = await getPageBySlug(slug)

    if (!page) {
      return {
        title: "Page Not Found",
      }
    }

    return {
      title: page.title,
      description: page.summary || undefined,
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Page",
    }
  }
}

/**
 * Dynamic page route that fetches and displays a page by slug
 * Route: /[page] (e.g., /about, /contact)
 */
export default async function DynamicPage({ params }: PageProps) {
  const { page: slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) {
    notFound()
  }

  const sections =
    page.render_mode === "sections" ? await getPageSectionsByPageId(page.id) : null

  const content = page.content as any
  const heroUrl = page.hero_image_enabled ? page.hero_image_url : null
  const heroAlt = page.hero_image_alt || page.title
  const heroFullBleed = page.hero_image_enabled ? !page.hero_constrain_to_container : false

  // Render page content
  // The content is stored as JSONB, so we'll render it as structured content
  // Note: Main wrapper is already provided by the root layout
  return (
    <article className="max-w-none space-y-8">
      {heroUrl ? (
        <header
          className={cn(
            "snap-start scroll-mt-24 relative overflow-hidden border border-(--pw-border) bg-secondary/20",
            heroFullBleed
              ? "left-1/2 w-dvw -translate-x-1/2 rounded-none"
              : "rounded-2xl",
          )}
        >
          <img
            src={heroUrl}
            alt={heroAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/25 to-black/70" />

          <div
            className={cn(
              "relative z-10 py-10",
              heroFullBleed ? "mx-auto max-w-5xl px-4 sm:px-6 lg:px-8" : "px-6 sm:px-10",
            )}
          >
            <h1 className="text-[2em] font-bold tracking-tight text-white sm:text-[2.5em]">
              {page.title}
            </h1>
            {page.summary ? (
              <p className="mt-3 text-[1.5em] leading-snug text-white/90">
                {page.summary}
              </p>
            ) : null}
            {page.published_at ? (
              <div className="mt-4 text-sm text-white/75">
                <time dateTime={page.published_at}>
                  {new Date(page.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
            ) : null}
          </div>
        </header>
      ) : (
        <header className="snap-start scroll-mt-24 space-y-3">
          <h1 className="text-[2em] font-bold tracking-tight text-foreground sm:text-[2.5em]">
            {page.title}
          </h1>
          {page.summary ? (
            <p className="text-[1.5em] leading-snug text-foreground/80">
              {page.summary}
            </p>
          ) : null}
          {page.published_at ? (
            <div className="text-sm text-foreground/70">
              <time dateTime={page.published_at}>
                {new Date(page.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          ) : null}
        </header>
      )}

      <div className="page-content">
        {page.render_mode === "sections" ? (
          <PageSectionsRenderer sections={sections || []} />
        ) : content ? (
          isLexicalFormat(content) ? (
            <LexicalRenderer
              content={content}
              className="prose prose-zinc dark:prose-invert max-w-none"
            />
          ) : typeof content === "object" ? (
            <div className="space-y-4">
              {Array.isArray(content.blocks) ? (
                content.blocks.map((block: any, index: number) => (
                  <div key={index}>
                    {block.type === "paragraph" && (
                      <p className="text-foreground/85 leading-7">{block.text}</p>
                    )}
                    {block.type === "heading" && (
                      <h2 className="mt-8 mb-4 text-[1.5em] font-semibold text-foreground">
                        {block.text}
                      </h2>
                    )}
                    {block.type === "list" && (
                      <ul className="list-disc list-inside space-y-2 text-foreground/85">
                        {block.items?.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              ) : content.html ? (
                <div
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.html) }}
                  className="prose prose-zinc dark:prose-invert max-w-none"
                />
              ) : content.text ? (
                <div className="whitespace-pre-wrap text-foreground/85 leading-7">
                  {content.text}
                </div>
              ) : (
                <p className="text-foreground/70 italic">No content available</p>
              )}
            </div>
          ) : typeof content === "string" ? (
            <LexicalRenderer
              content={content}
              className="prose prose-zinc dark:prose-invert max-w-none"
            />
          ) : (
            <p className="text-foreground/70 italic">No content available</p>
          )
        ) : (
          <p className="text-foreground/70 italic">No content available</p>
        )}
      </div>
    </article>
  )
}
