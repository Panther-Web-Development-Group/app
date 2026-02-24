"use client"

import { ShellToolbarItem } from "./Item"
import { LinkMenu } from "./Menus/LinkMenu"
import { Link } from "lucide-react"

export function LinkButton() {
  return (
    <ShellToolbarItem
      id="link"
      type="dropdown"
      icon={<Link className="h-4 w-4" />}
      description="Link"
      align="left"
    >
      <LinkMenu />
    </ShellToolbarItem>
  )
}
