"use client"

import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import { isNavActive, NAV_LINKS } from "@/app/globals/config/nav"
import { AccountNavPlaceholder } from "./AccountPlaceholder"
import { HeaderLogo } from "./Logo"
import { Hamburger } from "./Mobile/Hamburger"
import { NavBackdrop } from "./Overlay/NavBackdrop"
import { DesktopNav, MobileNav } from "./Navigation"
import { HeaderSearch } from "./Search"
import { HeaderThemeToggle } from "./ThemeToggle"

export { isNavActive, NAV_LINKS } from "@/app/globals/config/nav"
export type { NavLink } from "@/app/globals/config/nav"

export const Header = () => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const closeMenu = useCallback(() => {
    setOpen(false)
    document.body.style.overflow = ""
  }, [])

  const toggleMenu = useCallback(() => {
    setOpen((prev) => {
      const next = !prev
      document.body.style.overflow = next ? "hidden" : ""
      return next
    })
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => closeMenu(), 0)
    return () => window.clearTimeout(id)
  }, [pathname, closeMenu])

  const activeFor = useCallback(
    (href: string) => isNavActive(pathname, href),
    [pathname]
  )

  return (
    <>
      <NavBackdrop open={open} onClose={closeMenu} />
      <nav className="navbar" aria-label="Main">
        <div className="navbar-inner">
          <div className="navbar-start">
            <HeaderLogo />
          </div>
          <div className="navbar-end">
            <div className="navbar-desktop-nav">
              <DesktopNav links={NAV_LINKS} isActive={activeFor} />
            </div>
            <div className="navbar-search-theme">
              <HeaderSearch />
              <HeaderThemeToggle />
            </div>
            <AccountNavPlaceholder />
            <Hamburger open={open} onToggle={toggleMenu} />
          </div>
        </div>
      </nav>
      <MobileNav
        open={open}
        links={NAV_LINKS}
        isActive={activeFor}
        onNavigate={closeMenu}
      />
    </>
  )
}
