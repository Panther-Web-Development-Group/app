"use client"
import {
  FC,
  useCallback
} from "react"
import { HeaderProps } from "./types"
import { HeaderBrand } from "./Brand"
import { Logo } from "./Logo"
import { Navigation } from "./Navigation"
import { Search } from "./Search"
import { HeaderContainer } from "./Container"
import { useContainer } from "../Container/Context"
import { cn } from "@/lib/cn"

export const Header: FC<HeaderProps> = ({ className, ref: _ref, ...props }) => {
  const { navIsOpen, setNavIsOpen, hasHero, heroInView, showHeaderBackground, headerRef } = useContainer()

  const handleCloseNav = useCallback(() => {
    setNavIsOpen(false)
  }, [setNavIsOpen])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault()
        handleCloseNav()
        break
      default:
        break
    }
  }, [handleCloseNav])

  return (
    <header ref={headerRef} {...props} className={cn(
      "px-5 py-3 md:px-8 md:py-4 top-0 z-51 w-full transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.2)]",
      hasHero ? "fixed" : "sticky",
      heroInView
        ? "bg-black/10 backdrop-blur-md supports-[backdrop-filter]:bg-black/10"
        : "bg-header-background backdrop-blur supports-[backdrop-filter]:bg-header-background",
      className
    )}>
      <HeaderContainer>
        {navIsOpen && (
          <div
            role="button"
            tabIndex={0}
            className="fixed inset-0 z-[9998] h-dvh w-full min-h-screen bg-black/20 md:bg-black/10"
            onClick={handleCloseNav}
            onKeyDown={handleKeyDown}
            aria-label="Close navigation"
          />
        )}
        <div className="flex items-center justify-between gap-6">
          <HeaderBrand>PantherWeb</HeaderBrand>
          <Navigation>
            <Navigation.Content
              brand={
                <div className="flex items-center justify-between gap-2">
                  <div onClick={handleCloseNav} className="cursor-pointer min-w-0 shrink">
                    <Logo>PantherWeb</Logo>
                  </div>
                  <Navigation.Trigger className="shrink-0" />
                </div>
              }
              search={
                <Search className="w-full max-w-none" overHero={heroInView}>
                  <Search.Autocomplete>
                    <Search.Input placeholder="Search" />
                    <Search.Submit />
                    <Search.Autocomplete.Panel>
                      <Search.Autocomplete.Section title="Pages">
                        <Search.Autocomplete.Item
                          href="/"
                          image="/logos/PantherWeb-2.png"
                          title="Home"
                          description="Welcome to PantherWeb"
                        />
                        <Search.Autocomplete.Item
                          href="/about"
                          title="About"
                          description="Our team and history"
                        />
                        <Search.Autocomplete.Item
                          href="/contact"
                          title="Contact"
                          description="Get in touch"
                        />
                      </Search.Autocomplete.Section>
                    </Search.Autocomplete.Panel>
                  </Search.Autocomplete>
                </Search>
              }
            >
              <Navigation.List>
                <Navigation.Item href="/">Home</Navigation.Item>
                <Navigation.Item
                  href="/about"
                  subnav={
                    <Navigation.List>
                      <Navigation.Item href="/about/team">Team</Navigation.Item>
                      <Navigation.Item href="/about/history">History</Navigation.Item>
                    </Navigation.List>}
                >
                  About
                </Navigation.Item>
                <Navigation.Item href="/exec">Exec</Navigation.Item>
                <Navigation.Item href="/contact">Contact</Navigation.Item>
              </Navigation.List>
            </Navigation.Content>
          </Navigation>
          <Search className="max-md:hidden" overHero={heroInView}>
            <Search.Autocomplete>
              <Search.Input placeholder="Search" />
              <Search.Submit />
              <Search.Autocomplete.Panel>
                <Search.Autocomplete.Section title="Pages">
                  <Search.Autocomplete.Item
                    href="/"
                    image="/logos/PantherWeb-2.png"
                    imageAlt="Home"
                    title="Home"
                    description="Welcome to PantherWeb"
                  />
                  <Search.Autocomplete.Item
                    href="/about"
                    image="/logos/PantherWeb-1.png"
                    imageAlt="About"
                    title="About"
                    description="Our team and history"
                  />
                  <Search.Autocomplete.Item
                    href="/exec"
                    title="Exec"
                    description="Meet our executive board"
                  />
                  <Search.Autocomplete.Item
                    href="/contact"
                    title="Contact"
                    description="Get in touch"
                  />
                </Search.Autocomplete.Section>
                <Search.Autocomplete.Section title="Quick links">
                  <Search.Autocomplete.Item
                    href="/about/team"
                    title="Team"
                  />
                  <Search.Autocomplete.Item
                    href="/about/history"
                    title="History"
                  />
                </Search.Autocomplete.Section>
              </Search.Autocomplete.Panel>
            </Search.Autocomplete>
          </Search>
        </div>
      </HeaderContainer>
    </header>
  )
}