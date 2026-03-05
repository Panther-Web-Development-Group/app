"use client"

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type FC,
  type PropsWithChildren,
} from "react"
import type { ExecutiveMemberData } from "../data"
import { executives, executiveYears } from "../data"

export type ExecContextType = {
  activeYear: string | null
  setActiveYear: (year: string | null) => void
  executives: ExecutiveMemberData[]
  executiveYears: string[]
  filteredExecutives: ExecutiveMemberData[]
  executivesByYear: Map<string, ExecutiveMemberData[]>
}

const ExecContext = createContext<ExecContextType | undefined>(undefined)

export const useExec = () => {
  const context = useContext(ExecContext)
  if (!context) {
    throw new Error("useExec must be used within an ExecProvider.")
  }
  return context
}

export const ExecProvider: FC<PropsWithChildren> = ({ children }) => {
  const [activeYear, setActiveYearState] = useState<string | null>(null)

  const setActiveYear = useCallback((year: string | null) => {
    setActiveYearState(year)
  }, [])

  const filteredExecutives = useMemo(() => {
    if (!activeYear) return executives
    return executives.filter((e) => e.year === activeYear)
  }, [activeYear])

  const executivesByYear = useMemo(() => {
    const grouped = new Map<string, ExecutiveMemberData[]>()
    for (const exec of filteredExecutives) {
      const list = grouped.get(exec.year) ?? []
      list.push(exec)
      grouped.set(exec.year, list)
    }
    return grouped
  }, [filteredExecutives])

  const value = useMemo<ExecContextType>(
    () => ({
      activeYear,
      setActiveYear,
      executives,
      executiveYears,
      filteredExecutives,
      executivesByYear,
    }),
    [
      activeYear,
      setActiveYear,
      filteredExecutives,
      executivesByYear,
    ]
  )

  return (
    <ExecContext.Provider value={value}>
      {children}
    </ExecContext.Provider>
  )
}
