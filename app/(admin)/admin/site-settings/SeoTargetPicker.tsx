 "use client"
import { useCallback, useMemo, useState } from "react"
import { RadioGroup } from "@/app/components/Form/RadioGroup"
import { Combobox } from "@/app/components/Form/Combobox"
import { cn } from "@/lib/cn"

type MinimalRow = { id: string; title: string; slug: string; is_published: boolean }

export function SeoTargetPicker({
  pages,
  posts,
  className,
}: {
  pages: MinimalRow[]
  posts: MinimalRow[]
  className?: string
}) {
  const [targetType, setTargetType] = useState<"page" | "post">("page")
  const [targetId, setTargetId] = useState<string | undefined>(undefined)

  const items = useMemo(() => {
    return (targetType === "page" ? pages : posts).map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      is_published: p.is_published,
    }))
  }, [pages, posts, targetType])

  const handleTypeChange = useCallback((next: string) => {
    const t = next === "post" ? "post" : "page"
    setTargetType(t)
    setTargetId(undefined)
  }, [])

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <div className="sm:col-span-2">
        <div className="text-sm font-semibold text-foreground/80">Target type</div>
        <RadioGroup
          name="target_type"
          value={targetType}
          onValueChange={handleTypeChange}
          className="mt-2 flex flex-wrap gap-4"
        >
          <RadioGroup.Option value="page" label="Page" />
          <RadioGroup.Option value="post" label="Post" />
        </RadioGroup>
      </div>

      <div className="sm:col-span-2">
        <div className="text-sm font-semibold text-foreground/80">Target</div>
        <Combobox name="target_id" value={targetId} onValueChange={setTargetId} className="mt-1">
          <Combobox.Input
            placeholder={targetType === "page" ? "Search pages…" : "Search posts…"}
          />
          <Combobox.Content>
            {items.map((i) => (
              <Combobox.Option
                key={i.id}
                value={i.id}
                textValue={`${i.title} ${i.slug} ${i.is_published ? "" : "draft"} ${targetType}`}
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {i.title} {!i.is_published ? <span className="text-xs text-foreground/60">[draft]</span> : null}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-foreground/60">/{i.slug}</div>
                </div>
              </Combobox.Option>
            ))}
          </Combobox.Content>
        </Combobox>
        <p className="mt-1 text-xs text-foreground/70">
          Pick a {targetType} to attach SEO metadata to.
        </p>
      </div>
    </div>
  )
}

