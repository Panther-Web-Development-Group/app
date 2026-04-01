"use client"

import { useEffect, useRef, useState } from "react"

const TAGS = [
  "<html>",
  "</html>",
  "<div>",
  "</div>",
  "<p>",
  "</p>",
  "<span>",
  "<h1>",
  "</h1>",
  "<body>",
  "<header>",
  "</header>",
  "<nav>",
  "<section>",
  "<a>",
  "</a>",
  "<img />",
  "<input />",
  ".class {}",
  "#id",
  "{ }",
  "color:",
  "margin:",
  "padding:",
  "display:",
  "flex",
  "grid",
  "@media",
  ":root",
  "const",
  "let",
  "var",
  "=>",
  "function()",
  "return",
  "import",
  "export",
  "[ ]",
  "async",
  "await",
] as const

const COUNT = 28

function useHtmlDarkClass() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const el = document.documentElement
    const sync = () => setDark(el.classList.contains("dark"))
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(el, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  return dark
}

export const HomepageBackdrop = () => {
  const dark = useHtmlDarkClass()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    container.replaceChildren()

    const opacityMult = dark ? 2.35 : 1

    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement("span")
      el.className = "bg-tag"
      el.textContent = TAGS[i % TAGS.length] ?? ""

      const size = 0.65 + Math.random() * 0.6
      const left = Math.random() * 97
      const dur = 10 + Math.random() * 14
      const delay = -(Math.random() * dur)
      const opacity = (0.055 + Math.random() * 0.07) * opacityMult

      el.style.cssText = `
        --op: ${opacity};
        left: ${left}%;
        font-size: ${size}rem;
        animation-duration: ${dur}s;
        animation-delay: ${delay}s;
      `

      container.appendChild(el)
    }

    const updateFloor = () => {
      const footer = document.querySelector(".footer")
      if (!footer) {
        container.style.setProperty(
          "--floor",
          `${window.innerHeight - 10}px`
        )
        return
      }
      const top = footer.getBoundingClientRect().top
      const floor = Math.max(80, Math.min(top, window.innerHeight - 10))
      container.style.setProperty("--floor", `${floor}px`)
    }

    const t = window.setTimeout(updateFloor, 0)
    const controller = new AbortController()
    const { signal } = controller
    window.addEventListener("scroll", updateFloor, { passive: true, signal })
    window.addEventListener("resize", updateFloor, { passive: true, signal })

    return () => {
      controller.abort()
      window.clearTimeout(t)
    }
  }, [dark])

  return <div id="bg-tags" ref={ref} aria-hidden />
}
