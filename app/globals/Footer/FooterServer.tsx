import type { ReactNode } from "react"
import { createClient } from "@/app/supabase/services/server"
import { Footer, FooterLink, FooterSection, SocialLink } from "@/app/globals/Footer"
import { getIcon } from "@/lib/icons/iconMap"

type BrandingRow = {
  owner_id: string
  footer_logo: string | null
  footer_logo_alt: string | null
  updated_at: string
}

type FooterSectionRow = {
  id: string
  owner_id: string
  title: string
  order_index: number
}

type FooterLinkRow = {
  id: string
  owner_id: string
  section_id: string | null
  parent_link_id: string | null
  label: string
  href: string | null
  is_external: boolean
  target: string
  icon: string | null
  image: string | null
  order_index: number
}

type SocialLinkRow = {
  id: string
  owner_id: string
  platform: string
  label: string
  href: string
  icon: string | null
  image: string | null
  order_index: number
}

type LinkNode = FooterLinkRow & { children: LinkNode[] }

function buildLinkForest(links: FooterLinkRow[]) {
  const byId = new Map<string, LinkNode>()
  const roots: LinkNode[] = []

  for (const link of links) {
    byId.set(link.id, { ...link, children: [] })
  }

  for (const link of byId.values()) {
    if (link.parent_link_id) {
      const parent = byId.get(link.parent_link_id)
      if (parent) parent.children.push(link)
      else roots.push(link)
    } else {
      roots.push(link)
    }
  }

  const sortTree = (nodes: LinkNode[]) => {
    nodes.sort((a, b) => a.order_index - b.order_index || a.label.localeCompare(b.label))
    for (const n of nodes) sortTree(n.children)
  }
  sortTree(roots)

  const rootsBySection = new Map<string, LinkNode[]>()
  for (const node of roots) {
    if (!node.section_id) continue
    const arr = rootsBySection.get(node.section_id) ?? []
    arr.push(node)
    rootsBySection.set(node.section_id, arr)
  }

  // Ensure per-section ordering is stable
  for (const [sectionId, nodes] of rootsBySection.entries()) {
    sortTree(nodes)
    rootsBySection.set(sectionId, nodes)
  }

  return { rootsBySection }
}

function renderFooterLink(node: LinkNode, level = 0): ReactNode {
  const paddingLeft = level > 0 ? `${level * 0.75}rem` : undefined
  const icon = node.icon ? getIcon(node.icon, "h-4 w-4 text-secondary-foreground/70") : undefined

  return (
    <div key={node.id}>
      {node.href ? (
        <FooterLink
          label={node.label}
          href={node.href}
          isExternal={node.is_external}
          target={node.target}
          icon={icon}
          style={{ paddingLeft }}
          className="inline-flex items-center"
        />
      ) : (
        <div
          className="text-sm font-medium text-secondary-foreground/85"
          style={{ paddingLeft }}
        >
          <span className="inline-flex items-center gap-2">
            {icon ? <span>{icon}</span> : null}
            {node.label}
          </span>
        </div>
      )}

      {node.children.length > 0 ? (
        <div className="mt-2 flex flex-col gap-2">
          {node.children.map((child) => renderFooterLink(child, level + 1))}
        </div>
      ) : null}
    </div>
  )
}

export async function FooterServer() {
  const supabase = await createClient()

  // Prefer active branding for single-tenant owner selection
  const { data: branding } = await supabase
    .from("site_branding")
    .select("owner_id, footer_logo, footer_logo_alt, updated_at")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle<BrandingRow>()

  let ownerId = branding?.owner_id

  // Fallback: pick the first active footer section owner
  if (!ownerId) {
    const { data: sectionOwner } = await supabase
      .from("footer_sections")
      .select("owner_id")
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle<{ owner_id: string }>()
    ownerId = sectionOwner?.owner_id
  }

  const year = new Date().getFullYear()
  const brandLabel = "PantherWeb"

  if (!ownerId) {
    return (
      <Footer
        copyright={
          <>
            © {year} {brandLabel}. All rights reserved.
          </>
        }
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="text-sm font-semibold text-secondary-foreground">{brandLabel}</div>
        </div>
      </Footer>
    )
  }

  const [{ data: sections }, { data: links }, { data: socials }] =
    await Promise.all([
      supabase
        .from("footer_sections")
        .select("id, owner_id, title, order_index")
        .eq("owner_id", ownerId)
        .eq("is_active", true)
        .order("order_index", { ascending: true }),
      supabase
        .from("footer_links")
        .select(
          "id, owner_id, section_id, parent_link_id, label, href, is_external, target, icon, image, order_index"
        )
        .eq("owner_id", ownerId)
        .eq("is_active", true)
        .order("order_index", { ascending: true }),
      supabase
        .from("social_links")
        .select("id, owner_id, platform, label, href, icon, image, order_index")
        .eq("owner_id", ownerId)
        .eq("is_active", true)
        .order("order_index", { ascending: true }),
    ])

  const safeSections: FooterSectionRow[] = (sections ?? []) as FooterSectionRow[]
  const safeLinks: FooterLinkRow[] = (links ?? []) as FooterLinkRow[]
  const safeSocials: SocialLinkRow[] = (socials ?? []) as SocialLinkRow[]

  const { rootsBySection } = buildLinkForest(safeLinks)

  const sectionsNode =
    safeSections.length > 0
      ? safeSections.map((section) => {
          const sectionRoots = rootsBySection.get(section.id) ?? []
          return (
            <FooterSection key={section.id} title={section.title}>
              {sectionRoots.length > 0 ? (
                sectionRoots.map((node) => renderFooterLink(node))
              ) : (
                <span className="text-sm text-secondary-foreground/70">—</span>
              )}
            </FooterSection>
          )
        })
      : undefined

  const socialNode =
    safeSocials.length > 0
      ? safeSocials.map((s) => (
          <SocialLink
            key={s.id}
            platform={s.label || s.platform}
            href={s.href}
            icon={s.icon ? getIcon(s.icon, "h-5 w-5") : undefined}
            image={s.image ?? undefined}
            aria-label={s.label}
          />
        ))
      : undefined

  const brandingNode = (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex flex-col items-center gap-2">
        {branding?.footer_logo ? (
          // Use <img> to support any remote URL without next/image config.
          <img
            src={branding.footer_logo}
            alt={branding.footer_logo_alt || brandLabel}
            className="h-10 w-auto"
            loading="lazy"
          />
        ) : (
          <span className="text-base font-semibold text-secondary-foreground">{brandLabel}</span>
        )}
        <span className="text-sm text-secondary-foreground/70">{brandLabel}</span>
      </div>
    </div>
  )

  return (
    <Footer
      sections={sectionsNode}
      socialLinks={socialNode}
      copyright={
        <>
          © {year} {brandLabel}. All rights reserved.
        </>
      }
    >
      {brandingNode}
    </Footer>
  )
}

