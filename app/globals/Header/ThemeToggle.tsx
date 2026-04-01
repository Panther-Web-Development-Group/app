"use client"

import { Moon, Sun } from "lucide-react"
import { useLayoutEffect, useSyncExternalStore } from "react"

const STORAGE_KEY = "pw-theme"
const THEME_EVENT = "pw-theme"

function readIsDark(): boolean {
  if (typeof window === "undefined") return false
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "dark") return true
    if (stored === "light") return false
  } catch {
    /* private mode / blocked storage */
  }
  /* Default: light (ignore system preference until user toggles) */
  return false
}

function applyToDom(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark)
}

function subscribe(onStoreChange: () => void) {
  const onStorage = () => onStoreChange()
  const onTheme = () => onStoreChange()
  window.addEventListener("storage", onStorage)
  window.addEventListener(THEME_EVENT, onTheme)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(THEME_EVENT, onTheme)
  }
}

function getSnapshot() {
  return readIsDark()
}

function getServerSnapshot() {
  return false
}

export const HeaderThemeToggle = () => {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useLayoutEffect(() => {
    applyToDom(dark)
  }, [dark])

  const toggle = () => {
    const next = !dark
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light")
    } catch {
      /* still update DOM + event so UI works without persistence */
    }
    window.dispatchEvent(new Event(THEME_EVENT))
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
    </button>
  )
}
