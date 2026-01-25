import {
  Home,
  Info,
  Calendar,
  Book,
  Globe,
  Github,
  Instagram,
  Mail,
  Search,
  UserPlus,
  ChevronRight,
  FileText,
  GraduationCap,
  BookOpen,
  ExternalLink,
  type LucideIcon,
} from "lucide-react"
import { type ReactNode } from "react"

/**
 * Icon map for navigation items
 * Maps icon name strings to Lucide React icon components
 */
export const iconMap: Record<string, LucideIcon> = {
  home: Home,
  info: Info,
  calendar: Calendar,
  book: Book,
  globe: Globe,
  github: Github,
  instagram: Instagram,
  mail: Mail,
  search: Search,
  "user-plus": UserPlus,
  "chevron-right": ChevronRight,
  "file-text": FileText,
  "graduation-cap": GraduationCap,
  "book-open": BookOpen,
  "external-link": ExternalLink,
}

/**
 * Get icon component by name
 * @param iconName - The icon name (e.g., "home", "info")
 * @param className - Optional className for the icon
 * @returns ReactNode with the icon component or undefined
 */
export function getIcon(
  iconName: string | null | undefined,
  className?: string
): ReactNode {
  if (!iconName) return undefined

  const IconComponent = iconMap[iconName.toLowerCase()]
  if (!IconComponent) return undefined

  return (
    <IconComponent
      className={className || "h-5 w-5 text-zinc-500 dark:text-zinc-400"}
    />
  )
}
