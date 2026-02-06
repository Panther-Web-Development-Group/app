import type { ClassValue } from "clsx"

export type TitleWithSlugProps = {
  /** Current title value */
  title: string
  /** Current slug value */
  slug: string
  /** When true, slug is read-only and derived from title */
  slugLocked: boolean
  /** Called when title changes */
  onTitleChange: (title: string) => void
  /** Called when slug changes (only when slugLocked is false) */
  onSlugChange: (slug: string) => void
  /** Called when "Auto-generate slug from title" is toggled */
  onSlugLockedChange: (locked: boolean) => void

  /** Title input placeholder */
  titlePlaceholder?: string
  /** Slug input placeholder */
  slugPlaceholder?: string
  /** Title label */
  titleLabel?: string
  /** Slug label */
  slugLabel?: string
  /** Show required indicator on both inputs */
  required?: boolean

  /** Optional custom slug generator; default: title → lowercase, trim, replace non-word chars with "-" */
  generateSlug?: (title: string) => string

  className?: ClassValue
  titleLabelClassName?: ClassValue
  slugLabelClassName?: ClassValue
  inputClassName?: ClassValue
}
