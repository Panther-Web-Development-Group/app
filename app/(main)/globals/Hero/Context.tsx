"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type FC,
} from "react"
import type { HeroContextType, HeroType } from "./types"

export const HeroContext = createContext<HeroContextType | undefined>(undefined)

const HeroConfigContext = createContext<{
  setTotalSlides: (n: number) => void
  type: HeroType
} | undefined>(undefined)

export const useHero = () => {
  const context = useContext(HeroContext)
  if (!context) throw new Error("useHero must be used within a Hero component.")
  return context
}

export const useHeroConfig = () => useContext(HeroConfigContext)

type HeroProviderProps = {
  children: React.ReactNode
  defaultIndex?: number
  autoPlay?: number
  type?: HeroType
}

export const HeroProvider: FC<HeroProviderProps> = ({
  children,
  defaultIndex = 0,
  autoPlay = 0,
  type = "full",
}) => {
  const [totalSlides, setTotalSlides] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(defaultIndex)
  const [isPaused, setIsPaused] = useState(false)

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex((prev) => {
      if (totalSlides <= 0) return prev
      if (index < 0) return totalSlides - 1
      if (index >= totalSlides) return 0
      return index
    })
  }, [totalSlides])

  const goNext = useCallback(() => {
    if (totalSlides <= 0) return
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const goPrev = useCallback(() => {
    if (totalSlides <= 0) return
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  const pause = useCallback(() => setIsPaused(true), [])
  const resume = useCallback(() => setIsPaused(false), [])

  useEffect(() => {
    if (autoPlay <= 0 || isPaused || totalSlides <= 1) return
    const id = setInterval(goNext, autoPlay)
    return () => clearInterval(id)
  }, [autoPlay, isPaused, totalSlides, goNext])

  const configValue = useMemo(
    () => ({ setTotalSlides, type }),
    [type]
  )

  const contextValue = useMemo<HeroContextType>(
    () => ({
      currentIndex,
      totalSlides,
      goToSlide,
      goNext,
      goPrev,
      isPaused,
      pause,
      resume,
    }),
    [currentIndex, totalSlides, goToSlide, goNext, goPrev, isPaused, pause, resume]
  )

  return (
    <HeroConfigContext.Provider value={configValue}>
      <HeroContext.Provider value={contextValue}>
        {children}
      </HeroContext.Provider>
    </HeroConfigContext.Provider>
  )
}
