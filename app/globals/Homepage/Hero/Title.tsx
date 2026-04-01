"use client"

import { useEffect, useRef, useState } from "react"

import { DEFAULT_HERO_TITLE } from "./config"

export type HeroTitleProps = {
  /** Full string revealed by the typewriter effect */
  text?: string
  /** ms between characters */
  charIntervalMs?: number
  /** ms before typing starts */
  startDelayMs?: number
}

export const HeroTitle = ({
  text = DEFAULT_HERO_TITLE,
  charIntervalMs = 80,
  startDelayMs = 300,
}: HeroTitleProps) => {
  const [visible, setVisible] = useState(0)
  const intervalRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    setVisible(0)
    const startId = window.setTimeout(() => {
      let i = 0
      intervalRef.current = window.setInterval(() => {
        if (i <= text.length) {
          setVisible(i)
          i++
        } else if (intervalRef.current !== undefined) {
          window.clearInterval(intervalRef.current)
          intervalRef.current = undefined
        }
      }, charIntervalMs)
    }, startDelayMs)

    return () => {
      window.clearTimeout(startId)
      if (intervalRef.current !== undefined) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [text, charIntervalMs, startDelayMs])

  return (
    <h1 className="hero-title" id="hero-title">
      {text.slice(0, visible)}
      <span className="cursor">|</span>
    </h1>
  )
}
