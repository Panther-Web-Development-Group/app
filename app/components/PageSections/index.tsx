import { cn } from "@/lib/cn"
import { getIcon } from "@/lib/icons/iconMap"
import { LexicalRenderer } from "@/app/components/LexicalRenderer"
import type { PageSection } from "@/lib/supabase/server/sections"

type SectionThumbnail = {
  src: string
  alt?: string
  caption?: string
}

function isLexicalJson(content: unknown): content is { root: unknown } {
  return !!content && typeof content === "object" && "root" in content
}

function sanitizeHtml(html: string): string {
  if (!html) return ""

  let sanitized = html
  sanitized = sanitized.replace(/<html[^>]*>/gi, "")
  sanitized = sanitized.replace(/<\/html>/gi, "")
  sanitized = sanitized.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
  sanitized = sanitized.replace(/<body[^>]*>/gi, "")
  sanitized = sanitized.replace(/<\/body>/gi, "")
  return sanitized.trim()
}

function normalizeThumbnails(value: unknown): SectionThumbnail[] {
  if (!value) return []

  const arr = Array.isArray(value) ? value : [value]
  const out: SectionThumbnail[] = []

  for (const item of arr) {
    if (typeof item === "string") {
      const src = item.trim()
      if (src) out.push({ src })
      continue
    }

    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>
      const srcRaw = (obj.src ?? obj.url) as unknown
      const src = typeof srcRaw === "string" ? srcRaw.trim() : ""
      if (!src) continue

      const alt = typeof obj.alt === "string" ? obj.alt.trim() : undefined
      const caption =
        typeof obj.caption === "string" ? obj.caption.trim() : undefined

      out.push({ src, alt: alt || undefined, caption: caption || undefined })
    }
  }

  return out
}

function renderThumbnails(value: unknown) {
  const thumbs = normalizeThumbnails(value)
  if (!thumbs.length) return null

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {thumbs.map((t, idx) => (
        <figure key={`${t.src}-${idx}`} className="space-y-2">
          <img
            src={t.src}
            alt={t.alt || ""}
            className="w-full rounded-lg border border-(--pw-border) bg-background/10"
            loading="lazy"
          />
          {t.caption ? (
            <figcaption className="text-sm text-foreground/70">
              {t.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  )
}

const mdSpanByNumber: Record<number, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  9: "md:col-span-9",
  10: "md:col-span-10",
  11: "md:col-span-11",
  12: "md:col-span-12",
}

function renderSectionBody(content: unknown) {
  if (!content) return null

  // Lexical JSON
  if (isLexicalJson(content)) {
    return (
      <LexicalRenderer
        content={content}
        className="prose prose-zinc dark:prose-invert max-w-none"
      />
    )
  }

  const sectionTypes = {
    hero: (obj: Record<string, unknown>) => {
      const thumbnails = obj.thumbnails ?? obj.thumbnail
      return (
        <div className="space-y-3">
          <h2 className="text-[2em] font-bold tracking-tight text-foreground">
            {(obj.headline as string) || "Hero"}
          </h2>
          {typeof obj.subheadline === "string" && obj.subheadline ? (
            <p className="text-[1.5em] leading-snug text-foreground/75">
              {obj.subheadline}
            </p>
          ) : null}
          {renderThumbnails(thumbnails)}
        </div>
      )
    },
    card: (obj: Record<string, unknown>) => {
      const thumbnails = obj.thumbnails ?? obj.thumbnail
      return (
        <div className="space-y-2">
          {typeof obj.title === "string" && obj.title ? 
            <div className="text-base font-semibold text-foreground">{obj.title}</div> : 
            null}
          {typeof obj.body === "string" && obj.body ? 
            <p className="text-base leading-7 text-foreground/75">{obj.body}</p> : 
            null}
          {renderThumbnails(thumbnails)}
        </div>
      )
    },
    richText: (obj: Record<string, unknown>) => {
      if (!obj.html || typeof obj.html !== "string") return null
      const html = sanitizeHtml(obj.html as string)
      return (
        <div className="space-y-6">
          <div className="prose prose-zinc dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )
    },
    custom: (obj: Record<string, unknown>) => {
      const thumbnails = obj.thumbnails ?? obj.thumbnail
      return (
        <div className="space-y-6">
          <pre className="whitespace-pre-wrap wrap-break-word rounded-lg border border-(--pw-border) bg-background/15 p-4 text-xs text-foreground/80">
            {JSON.stringify(obj, null, 2)}
          </pre>
          {renderThumbnails(thumbnails)}
        </div>
      )
    }
  }

  // Seeded section formats
  if (typeof content === "object") {
    const { type, ...rest } = content as Record<string, unknown>
    const renderFn = sectionTypes[type as keyof typeof sectionTypes]
    if (renderFn) return renderFn(rest)
    return sectionTypes.custom(rest)
  }

  // HTML string fallback
  if (typeof content === "string") {
    const html = sanitizeHtml(content)
    return (
      <div
        className="prose prose-zinc dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return null
}

export function PageSectionsRenderer({
  sections,
  className,
}: {
  sections: PageSection[]
  className?: string
}) {
  if (!sections || sections.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-(--pw-border) bg-secondary/20 p-6 text-sm text-foreground/75",
          className,
        )}
      >
        No sections available.
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-12 gap-4", className)}>
      {sections.map((section) => {
        const isPartial = section.width === "partial"
        const span =
          isPartial && section.column_span ? mdSpanByNumber[section.column_span] : "md:col-span-12"

        const icon = section.icon
          ? getIcon(section.icon, "h-4 w-4 text-zinc-500 dark:text-zinc-400")
          : undefined

        return (
          <section
            key={section.id}
            className={cn(
              "col-span-12",
              span,
              "snap-start scroll-mt-24 rounded-xl border border-(--pw-border) bg-secondary/20 p-6",
            )}
          >
            {section.title || icon ? (
              <header className="mb-4 flex items-center gap-2">
                {icon}
                {section.title ? (
                  <h3 className="text-sm font-semibold text-foreground">
                    {section.title}
                  </h3>
                ) : null}
              </header>
            ) : null}

            {renderSectionBody(section.content)}
          </section>
        )
      })}
    </div>
  )
}

