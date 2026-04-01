"use client"

import { useLayoutEffect, useSyncExternalStore } from "react"

const LIGHT = "#ffffff"
const DARK = "#0c0c0c"

function subscribe(onChange: () => void) {
  const el = document.documentElement
  const obs = new MutationObserver(onChange)
  obs.observe(el, { attributes: true, attributeFilter: ["class"] })
  return () => obs.disconnect()
}

function snapshotDark() {
  return document.documentElement.classList.contains("dark")
}

/** Keeps `<meta name="theme-color">` in sync with `.dark` (mobile browser chrome). */
export const ThemeColorMeta = () => {
  const dark = useSyncExternalStore(subscribe, snapshotDark, () => false)

  useLayoutEffect(() => {
    let meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement("meta")
      meta.setAttribute("name", "theme-color")
      document.head.appendChild(meta)
    }
    meta.setAttribute("content", dark ? DARK : LIGHT)
  }, [dark])

  return null
}
