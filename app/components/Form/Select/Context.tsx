 "use client"
import {
  createContext,
  useContext,
} from "react"
import type { SelectContextValue } from "./types"

const SelectContext = createContext<SelectContextValue | null>(null)

export function SelectProvider({
  value,
  children,
}: {
  value: SelectContextValue
  children: React.ReactNode
}) {
  return <SelectContext.Provider value={value}>{children}</SelectContext.Provider>
}

export function useSelectContext() {
  const ctx = useContext(SelectContext)
  if (!ctx) throw new Error("Select components must be used within a Select")
  return ctx
}

