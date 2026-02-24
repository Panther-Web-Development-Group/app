"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

export type BlockNodeType = "image" | "card" | "video" | "gallery"

interface BlockSelectionContextValue {
  selectedNodeKey: string | null
  selectedNodeType: BlockNodeType | null
  selectBlock: (nodeKey: string, nodeType: BlockNodeType) => void
  clearSelection: () => void
}

const BlockSelectionContext = createContext<BlockSelectionContextValue | null>(null)

export function BlockSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null)
  const [selectedNodeType, setSelectedNodeType] = useState<BlockNodeType | null>(null)

  const selectBlock = useCallback((nodeKey: string, nodeType: BlockNodeType) => {
    setSelectedNodeKey(nodeKey)
    setSelectedNodeType(nodeType)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedNodeKey(null)
    setSelectedNodeType(null)
  }, [])

  return (
    <BlockSelectionContext.Provider
      value={{ selectedNodeKey, selectedNodeType, selectBlock, clearSelection }}
    >
      {children}
    </BlockSelectionContext.Provider>
  )
}

export function useBlockSelection() {
  const context = useContext(BlockSelectionContext)
  if (!context) {
    throw new Error("useBlockSelection must be used within BlockSelectionProvider")
  }
  return context
}
