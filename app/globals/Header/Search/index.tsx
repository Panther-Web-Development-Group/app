"use client"

import { Search, X } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { NAV_LINKS } from "@/app/globals/config/nav"

export const HeaderSearch = () => {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = useMemo(() => {
    const lower = q.trim().toLowerCase()
    const pool = [...NAV_LINKS]
    if (!lower) return pool.slice(0, 6)
    return pool.filter(
      (l) =>
        l.label.toLowerCase().includes(lower) ||
        l.href.toLowerCase().includes(lower)
    )
  }, [q])

  const close = useCallback(() => {
    setOpen(false)
    setQ("")
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, close])

  useEffect(() => {
    const onPointer = (e: MouseEvent | PointerEvent) => {
      if (!open || !rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) close()
    }
    window.addEventListener("pointerdown", onPointer)
    return () => window.removeEventListener("pointerdown", onPointer)
  }, [open, close])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  return (
    <div className="navbar-search" ref={rootRef}>
      <button
        type="button"
        className="navbar-search-trigger"
        aria-expanded={open}
        aria-controls="header-search-floating"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close search" : "Open search"}
      >
        {open ? <X size={20} strokeWidth={2} /> : <Search size={20} strokeWidth={2} />}
      </button>
      {open ? (
        <div
          id="header-search-floating"
          className="navbar-search-floating"
          role="dialog"
          aria-label="Site search"
        >
          <div className="navbar-search-floating-inner">
            <label className="navbar-search-label" htmlFor="header-search-input">
              Search
            </label>
            <input
              id="header-search-input"
              ref={inputRef}
              type="search"
              className="navbar-search-input"
              placeholder="Search pages…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoComplete="off"
            />
            <p className="navbar-search-autocomplete-label">Suggestions</p>
            <ul className="navbar-search-autocomplete">
              {suggestions.length === 0 ? (
                <li className="navbar-search-empty">No matches</li>
              ) : (
                suggestions.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} onClick={close}>
                      {label}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}
