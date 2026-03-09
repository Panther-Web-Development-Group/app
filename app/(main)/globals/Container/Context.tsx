"use client"
import React, {
  useContext,
  createContext,
  useRef,
  useState,
  useMemo,
  useEffect,
  useCallback,
  type FC
} from "react"

import type { 
  ContainerProviderProps,
  ContainerContextType
} from "./types"

export const ContainerContext = createContext<ContainerContextType | undefined>(undefined)

export const useContainer = () => {
  const context = useContext(ContainerContext)
  if (!context) throw new Error("useContainer must be used within a ContainerProvider.")
  return context
}

export const ContainerProvider: FC<ContainerProviderProps> = ({ children }) => {
  const [navIsOpen, setNavIsOpen] = useState(false)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasHero, setHasHeroState] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement | null>(null)

  const setHasHero = useCallback((value: boolean) => {
    setHasHeroState((prev) => (prev === value ? prev : value))
  }, [])

  useEffect(() => {
    const target = hasHero ? heroRef.current : containerRef.current
    if (!target) {
      if (!hasHero) setIsIntersecting(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry?.isIntersecting ?? false),
      { root: null, rootMargin: "0px", threshold: 0 }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [hasHero])

  const heroInView = hasHero && isIntersecting
  const showHeaderBackground = !heroInView

  const contextValue = useMemo(
    () => ({
      navIsOpen,
      setNavIsOpen,
      isIntersecting,
      headerRef,
      setIsIntersecting,
      containerRef,
      heroRef,
      hasHero,
      setHasHero,
      heroInView,
      showHeaderBackground,
    } as ContainerContextType),
    [navIsOpen, isIntersecting, hasHero, heroInView, showHeaderBackground]
  )

  const child = React.Children.only(children) as React.ReactElement<{ ref?: React.Ref<HTMLDivElement> }>
  return (
    <ContainerContext.Provider value={contextValue}>
      {React.cloneElement(child, { ref: containerRef } as React.ComponentPropsWithRef<'div'>)}
    </ContainerContext.Provider>
  )
}