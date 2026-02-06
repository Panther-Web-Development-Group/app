import { cn } from "@/lib/cn"
import { getIcon } from "@/lib/icons/iconMap"
import { LexicalRenderer } from "@/app/components/LexicalRenderer"
import { CardGroup } from "@/app/components/Card"
import type { PageSection } from "@/lib/supabase/server/sections"
import type { 
  PageSectionObject, 
  PageSectionType,
  PageSectionPayloads 
} from "@/lib/supabase/structures"

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

  // Type-safe section rendering
  function renderSection<T extends PageSectionType>(
    section: PageSectionObject<T>
  ) {
    const { type, payload } = section

    switch (type) {
      case "hero": {
        const heroPayload = payload as PageSectionPayloads["hero"]
        const thumbnails = heroPayload.thumbnails ?? heroPayload.thumbnail
        return (
          <div className="space-y-3">
            <h2 className="text-[2em] font-bold tracking-tight text-foreground">
              {heroPayload.headline || "Hero"}
            </h2>
            {heroPayload.subheadline ? (
              <p className="text-[1.5em] leading-snug text-foreground/75">
                {heroPayload.subheadline}
              </p>
            ) : null}
            {heroPayload.cta ? (
              <div className="mt-4">
                <a
                  href={heroPayload.cta.url}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
                >
                  {heroPayload.cta.icon}
                  {heroPayload.cta.label}
                </a>
              </div>
            ) : null}
            {renderThumbnails(thumbnails)}
          </div>
        )
      }
      case "card": {
        const cardPayload = payload as PageSectionPayloads["card"]
        const thumbnails = cardPayload.thumbnails ?? cardPayload.thumbnail
        
        // Convert thumbnails to image format
        const images = thumbnails
          ? (Array.isArray(thumbnails) ? thumbnails : [thumbnails])
              .map((thumb) => {
                if (typeof thumb === "string") {
                  return { src: thumb, alt: cardPayload.title || "" }
                }
                return null
              })
              .filter((img): img is { src: string; alt: string } => img !== null)
          : undefined
        
        const image = images && images.length === 1 ? images[0] : undefined
        const multipleImages = images && images.length > 1 ? images : undefined

        return (
          <CardGroup
            cards={[
              {
                title: cardPayload.title,
                body: cardPayload.body,
                image: image,
                images: multipleImages,
                link: cardPayload.link_href
                  ? {
                      href: cardPayload.link_href,
                      label: "Learn more",
                    }
                  : undefined,
              },
            ]}
            columns={1}
            gap="md"
          />
        )
      }
      case "richText": {
        const richTextPayload = payload as PageSectionPayloads["richText"]
        const html = sanitizeHtml(richTextPayload.html)
        return (
          <div className="space-y-6">
            <div
              className="prose prose-zinc dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )
      }
      case "gallery": {
        const galleryPayload = payload as PageSectionPayloads["gallery"]
        return (
          <div className="space-y-4">
            <p className="text-sm text-foreground/70">
              Gallery: {galleryPayload.gallery_id}
              {galleryPayload.layout && ` (${galleryPayload.layout})`}
            </p>
            {/* Gallery component would be rendered here */}
          </div>
        )
      }
      case "slideshow": {
        const slideshowPayload = payload as PageSectionPayloads["slideshow"]
        return (
          <div className="space-y-4">
            <p className="text-sm text-foreground/70">
              Slideshow: {slideshowPayload.slideshow_id}
            </p>
            {/* Slideshow component would be rendered here */}
          </div>
        )
      }
      case "events": {
        const eventsPayload = payload as PageSectionPayloads["events"]
        return (
          <div className="space-y-4">
            <p className="text-sm text-foreground/70">
              Events list
              {eventsPayload.category_id && ` (category: ${eventsPayload.category_id})`}
              {eventsPayload.limit && ` (limit: ${eventsPayload.limit})`}
            </p>
            {/* Events component would be rendered here */}
          </div>
        )
      }
      case "custom": {
        const customPayload = payload as PageSectionPayloads["custom"]
        const thumbnails = (customPayload as any).thumbnails ?? (customPayload as any).thumbnail
        return (
          <div className="space-y-6">
            <pre className="whitespace-pre-wrap wrap-break-word rounded-lg border border-(--pw-border) bg-background/15 p-4 text-xs text-foreground/80">
              {JSON.stringify(customPayload, null, 2)}
            </pre>
            {renderThumbnails(thumbnails)}
          </div>
        )
      }
    }
  }

  // Try to parse as typed section object
  if (typeof content === "object" && content !== null) {
    const obj = content as Record<string, unknown>
    if ("type" in obj && typeof obj.type === "string") {
      const section = content as PageSectionObject<PageSectionType>
      try {
        return renderSection(section)
      } catch {
        // Fall through to legacy handling
      }
    }
  }

  // Legacy format handling (backward compatibility)
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

  // Legacy section formats
  if (typeof content === "object" && content !== null) {
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

