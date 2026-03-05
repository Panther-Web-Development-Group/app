import {
  PropsWithChildren,
  DetailedHTMLProps,
  HTMLAttributes,
  RefObject,
  ComponentPropsWithRef
} from "react"

export type ContainerProviderProps = PropsWithChildren 

export type ContainerContextType = {
  headerRef: RefObject<HTMLElement>
  containerRef: RefObject<HTMLDivElement>
  heroRef: RefObject<HTMLElement | null>
  navIsOpen: boolean
  setNavIsOpen: (navIsOpen: boolean) => void
  hasHero: boolean
  setHasHero: (hasHero: boolean) => void
  isIntersecting: boolean
  setIsIntersecting: (isIntersecting: boolean) => void
  /** True when hero exists and is in view */
  heroInView: boolean
  /** True when header should show background (scrolled past hero or no hero) */
  showHeaderBackground: boolean
}

export type ContainerProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>