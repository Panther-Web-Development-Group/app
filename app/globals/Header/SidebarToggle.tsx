"use client"

import { type FC } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/cn"
import { usePageContext } from "../Page/Context"
import { Button } from "@/app/components/Button"

type SidebarToggleProps = {
  className?: string
}

export const SidebarToggle: FC<SidebarToggleProps> = ({ className }) => {
  const { navIsOpen, setNavIsOpen } = usePageContext()

  return (
    <Button
      type="button"
      data-sidebar-toggle
      onClick={() => setNavIsOpen(!navIsOpen)}
      className={cn(
        "flex items-center justify-center h-10 w-10 rounded-lg",
        "text-foreground transition-colors",
        "hover:bg-accent/25",
        className
      )}
      aria-label={navIsOpen ? "Close sidebar" : "Open sidebar"}
      aria-expanded={navIsOpen}
      variant="icon"
    >
      {navIsOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
    </Button>
  )
}
