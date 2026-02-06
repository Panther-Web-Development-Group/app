"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useBlockSelection } from "./BlockSelectionContext"

interface FloatingMenuProps {
  children: (props: {
    nodeKey: string | null
    nodeType: "image" | "card" | "video" | null
    position: { top: number; left: number } | null
  }) => React.ReactNode
}

export function FloatingMenu({ children }: FloatingMenuProps) {
  const [editor] = useLexicalComposerContext()
  const { selectedNodeKey, selectedNodeType, clearSelection } = useBlockSelection()
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback(() => {
    if (!selectedNodeKey || !selectedNodeType) {
      setPosition(null)
      return
    }

    const element = editor.getElementByKey(selectedNodeKey)
    if (element) {
      const rect = element.getBoundingClientRect()
      const editorElement = editor.getRootElement()
      if (editorElement) {
        const editorRect = editorElement.getBoundingClientRect()
        setPosition({
          top: rect.top - editorRect.top - 8,
          left: rect.left - editorRect.left + rect.width / 2,
        })
      }
    }
  }, [editor, selectedNodeKey, selectedNodeType])

  useEffect(() => {
    updatePosition()
  }, [updatePosition])

  // Update position on scroll/resize
  useEffect(() => {
    if (!selectedNodeKey) return

    const handleUpdate = () => {
      updatePosition()
    }

    window.addEventListener("scroll", handleUpdate, true)
    window.addEventListener("resize", handleUpdate)

    return () => {
      window.removeEventListener("scroll", handleUpdate, true)
      window.removeEventListener("resize", handleUpdate)
    }
  }, [selectedNodeKey, updatePosition])

  // Close menu when clicking outside
  useEffect(() => {
    if (!selectedNodeKey) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (menuRef.current && !menuRef.current.contains(target)) {
        const element = editor.getElementByKey(selectedNodeKey)
        if (element && !element.contains(target)) {
          clearSelection()
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [editor, selectedNodeKey, clearSelection])

  if (!selectedNodeKey || !selectedNodeType || !position) {
    return null
  }

  return (
    <div
      ref={menuRef}
      className="absolute z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%) translateY(-100%)",
      }}
    >
      {children({ nodeKey: selectedNodeKey, nodeType: selectedNodeType, position })}
    </div>
  )
}
