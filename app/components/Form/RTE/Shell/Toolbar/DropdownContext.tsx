"use client"

import { createContext, useContext } from "react"

interface ToolbarDropdownContextValue {
  onClose: () => void
  isOpen: boolean
}

const ToolbarDropdownContext = createContext<ToolbarDropdownContextValue | null>(null)

export function useToolbarDropdown() {
  const ctx = useContext(ToolbarDropdownContext)
  return ctx
}

export { ToolbarDropdownContext }
