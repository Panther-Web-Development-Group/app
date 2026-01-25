import { type FC } from "react"
import type { HeaderProps } from "./types"
import { HeaderLogo } from "./Logo"
import { SidebarToggle } from "./SidebarToggle"
import { cn } from "@/lib/cn"

export const Header: FC<HeaderProps> = ({ 
  children, 
  className,
  logo,
  showSidebarToggle = true,
  ...props 
}) => {
  return (
    <header 
      className={cn(
        "sticky top-0 z-30 w-full border-b backdrop-blur-sm",
        "border-(--pw-border) bg-secondary/60 text-foreground",
        className
      )}
      {...props}
    >
      <div className="container mx-auto relative flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {showSidebarToggle && <SidebarToggle />}
          {logo || <HeaderLogo />}
        </div>
        {children ? <div className="flex items-center gap-2">{children}</div> : null}
      </div>
    </header>
  )
}
