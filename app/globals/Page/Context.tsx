"use client"

import {
  useContext,
  createContext,
  useState,
  useMemo,
  type FC
} from "react"
import type { PageContextProps, PageProviderProps } from "./types"

export const PageContext = createContext<PageContextProps | null>(null)

export const usePageContext = () => {
  const context = useContext(PageContext)
  if (!context) throw new Error("usePageContext() must be used within a PageProvider")
  return context
}

export const PageProvider: FC<PageProviderProps> = ({ children }) => {
  const [navIsOpen, setNavIsOpen] = useState(false)

  const value = useMemo<PageContextProps>(() => ({
    navIsOpen,
    setNavIsOpen,
  }), [navIsOpen, setNavIsOpen])

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  )
}