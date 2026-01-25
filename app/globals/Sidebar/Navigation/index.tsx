import { type FC } from "react"
import { cn } from "@/lib/cn"
import type { SidebarNavigationProps, NavigationItem } from "../types"
import { getNavigationTree } from "@/lib/supabase/server"
import { getIcon } from "@/lib/icons/iconMap"
import { NavItem } from "./NavItem"

type SidebarNavigationServerProps = Omit<SidebarNavigationProps, "items"> & {
  items?: NavigationItem[]
}

type DbNavigationNode = {
  id: string
  label: string
  href: string | null
  icon: string | null
  image: string | null
  is_external: boolean | null
  target: string | null
  order_index: number | null
  children?: DbNavigationNode[]
}

export const SidebarNavigation: FC<SidebarNavigationProps> = ({
  items = [],
  className,
  ...props
}) => {
  if (items.length === 0) {
    return (
      <nav className={cn("flex flex-col gap-1", className)} {...props}>
        <p className="px-3 py-2 text-sm text-secondary-foreground/70">
          No navigation items
        </p>
      </nav>
    )
  }

  return (
    <nav className={cn("overflow-hidden", className)} {...props}>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </ul>
    </nav>
  )
}

// Server component version that fetches from database
export async function SidebarNavigationServer({
  className,
  ...props
}: SidebarNavigationServerProps) {
  const data = await getNavigationTree()
  
  // Transform database data to NavigationItem format with icon mapping
  const transformItem = (item: DbNavigationNode): NavigationItem => ({
    id: item.id,
    label: item.label,
    href: item.href,
    icon: getIcon(item.icon),
    image: item.image,
    is_external: item.is_external || false,
    target: item.target || "_self",
    order_index: item.order_index || 0,
    children:
      item.children && item.children.length > 0
        ? item.children.map(transformItem)
        : undefined,
  })
  
  const items: NavigationItem[] = ((data || []) as DbNavigationNode[]).map(transformItem)
  
  return <SidebarNavigation items={items} className={className} {...props} />
}
