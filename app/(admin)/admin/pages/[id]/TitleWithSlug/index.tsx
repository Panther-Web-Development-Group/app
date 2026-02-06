"use client"

import { useCallback, useId, type FC } from "react"
import type { TitleWithSlugProps } from "./types"
import { cn } from "@/lib/cn"
import { Button } from "@/app/components/Button"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { Input } from "@/app/components/Form/Input"
import { Label } from "@/app/components/Form/Label"
import { Lock, Unlock } from "lucide-react"

function defaultGenerateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const TitleWithSlug: FC<TitleWithSlugProps> = ({
  title,
  slug,
  slugLocked,
  onTitleChange,
  onSlugChange,
  onSlugLockedChange,
  titlePlaceholder = "Page title",
  slugPlaceholder = "page-slug",
  titleLabel = "Title",
  slugLabel = "Slug",
  required = true,
  generateSlug = defaultGenerateSlug,
  className,
  titleLabelClassName,
  slugLabelClassName,
  inputClassName,
}) => {
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextTitle = e.target.value
      onTitleChange(nextTitle)
      if (slugLocked) onSlugChange(generateSlug(nextTitle))
    },
    [generateSlug, onSlugChange, onTitleChange, slugLocked]
  )

  const handleSlugChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (slugLocked) return
      onSlugChange(e.target.value)
    },
    [onSlugChange, slugLocked]
  )

  const handleSlugLockedChange = useCallback(
    (next: boolean) => {
      onSlugLockedChange(next)
      if (next) onSlugChange(generateSlug(title))
    },
    [generateSlug, onSlugChange, onSlugLockedChange, title]
  )

  const defaultLabelClass = "mb-2 block text-sm font-medium text-foreground/80"
  const baseInputClass =
    "h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground placeholder-foreground/50 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-(--pw-ring) hover:bg-background/15"

  const generatedId = useId()
  const slugInputId = `${generatedId}-slug`

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-4 md:grid-cols-2">
        <InputGroup
          required={required}
          label={titleLabel}
          value={title}
          onChange={handleTitleChange}
          placeholder={titlePlaceholder}
          labelClassName={titleLabelClassName ?? defaultLabelClass}
          inputClassName={cn(baseInputClass, inputClassName)}
        />
        <div className={cn("space-y-1.5")}>
          <Label
            htmlFor={slugInputId}
            className={cn("block text-sm font-semibold text-foreground/80", slugLabelClassName ?? defaultLabelClass)}
          >
            {required ? (
              <span className="inline-flex items-center gap-1">
                <span>{slugLabel}</span>
                <span aria-hidden className="text-red-500">*</span>
              </span>
            ) : (
              slugLabel
            )}
          </Label>
          <div className="relative">
            <Input
              id={slugInputId}
              type="text"
              value={slug}
              readOnly={slugLocked}
              onChange={handleSlugChange}
              placeholder={slugPlaceholder}
              required={required}
              aria-label={slugLabel}
              className={cn(
                baseInputClass,
                "pr-10",
                slugLocked && "read-only:bg-background/10 read-only:text-foreground/70",
                inputClassName
              )}
            />
            <Button
              type="button"
              tabIndex={-1}
              onClick={() => handleSlugLockedChange(!slugLocked)}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-foreground/60 transition-colors",
                "hover:bg-background/15 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--pw-ring)"
              )}
              aria-label={slugLocked ? "Unlock slug to edit manually" : "Lock slug to auto-generate from title"}
              title={slugLocked ? "Unlock slug to edit manually" : "Lock slug to auto-generate from title"}
            >
              {slugLocked ? (
                <Lock className="h-4 w-4" aria-hidden />
              ) : (
                <Unlock className="h-4 w-4" aria-hidden />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
