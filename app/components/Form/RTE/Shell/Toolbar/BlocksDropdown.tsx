"use client"

import { useState, type ReactNode } from "react"
import { LayoutGrid, ChevronRight, ImageIcon, MessageSquareQuote, Video as VideoIcon } from "lucide-react"
import { ShellToolbarItem } from "./Item"
import { ThumbnailMenu } from "./Menus/ThumbnailMenu"
import { CalloutMenu } from "./Menus/CalloutMenu"
import { VideoMenu } from "./Menus/VideoMenu"
import { cn } from "@/lib/cn"

interface CollapsibleSectionProps {
  label: string
  icon?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
}

function CollapsibleSection({
  label,
  icon,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="flex flex-col border-b border-foreground/10 dark:border-foreground/20 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-foreground",
          "hover:bg-foreground/5 dark:hover:bg-foreground/10",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-(--pw-ring) focus-visible:ring-inset"
        )}
        aria-expanded={open}
      >
        {icon}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronRight
          className={cn("h-4 w-4 shrink-0 text-foreground/50 transition-transform", open && "rotate-90")}
          aria-hidden
        />
      </button>
      {open && (
        <div className="min-w-0 overflow-hidden px-1 pb-2 pt-0">
          {children}
        </div>
      )}
    </div>
  )
}

/** Toolbar dropdown to insert custom blocks: Thumbnail, Callout, Video. */
export function BlocksDropdown() {
  return (
    <ShellToolbarItem
      id="blocks"
      type="dropdown"
      icon={<LayoutGrid className="h-4 w-4" />}
      description="Insert block"
      align="left"
      contentClassName="min-w-[280px] w-[280px] p-0"
    >
      <div className="flex min-w-0 flex-col overflow-hidden">
        <CollapsibleSection label="Thumbnail" icon={<ImageIcon className="h-4 w-4 text-foreground/60" />}>
          <ThumbnailMenu />
        </CollapsibleSection>
        <CollapsibleSection label="Callout" icon={<MessageSquareQuote className="h-4 w-4 text-foreground/60" />}>
          <CalloutMenu />
        </CollapsibleSection>
        <CollapsibleSection label="Video" icon={<VideoIcon className="h-4 w-4 text-foreground/60" />}>
          <VideoMenu />
        </CollapsibleSection>
      </div>
    </ShellToolbarItem>
  )
}
