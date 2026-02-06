"use client"
import { createContext, useContext } from "react"
import type { ComboboxContextValue } from "./types"

const ComboboxContext = createContext<ComboboxContextValue | null>(null)

export function ComboboxProvider({
  value,
  children,
}: {
  value: ComboboxContextValue
  children: React.ReactNode
}) {
  return <ComboboxContext.Provider value={value}>{children}</ComboboxContext.Provider>
}

export function useComboboxContext() {
  const ctx = useContext(ComboboxContext)
  if (!ctx) throw new Error("Combobox components must be used within a Combobox")
  return ctx
}

