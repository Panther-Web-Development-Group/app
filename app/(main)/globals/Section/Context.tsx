"use client"

import { createContext, useContext, type FC, type PropsWithChildren } from "react"

export type SectionType = "full" | "screen" | "medium" | "narrow"

const SectionContext = createContext<SectionType | undefined>(undefined)

export const useSection = () => useContext(SectionContext)

type SectionProviderProps = PropsWithChildren<{ type?: SectionType }>

export const SectionProvider: FC<SectionProviderProps> = ({
  children,
  type = "full",
}) => {
  return (
    <SectionContext.Provider value={type}>
      {children}
    </SectionContext.Provider>
  )
}
