"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import type { LexicalEditor } from "lexical"
import { useRTEContext } from "../../Context"
import { ShellToolbarButton } from "./Button"
import { DropdownMenu } from "@/app/components/Form/Editor/Toolbar/DropdownMenu"
import { ToolbarDropdownContext } from "./DropdownContext"
import type { ShellToolbarItemProps } from "./types"

function DropdownMenuWithClose({
  trigger,
  title,
  children,
  align,
  contentClassName,
}: {
  trigger: ReactNode
  title?: string
  children: ReactNode
  align?: "left" | "right" | "center"
  contentClassName?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <DropdownMenu
      trigger={trigger}
      title={title}
      showChevron={false}
      open={open}
      onOpenChange={setOpen}
      align={align}
      contentClassName={contentClassName}
    >
      <ToolbarDropdownContext.Provider value={{ onClose: () => setOpen(false), isOpen: open }}>
        {children}
      </ToolbarDropdownContext.Provider>
    </DropdownMenu>
  )
}

// Map format command IDs to their format type names
const FORMAT_COMMAND_MAP: Record<string, "bold" | "italic" | "underline" | "strikethrough" | "code"> = {
  bold: "bold",
  italic: "italic",
  underline: "underline",
  strikethrough: "strikethrough",
  code: "code",
}

export function ShellToolbarItem(props: ShellToolbarItemProps) {
  const { id, description, icon, type, align } = props
  const [editor] = useLexicalComposerContext()
  const { registerToolbarItem, activeFormats } = useRTEContext()
  const formatType = type === "command" ? FORMAT_COMMAND_MAP[id] : undefined
  const isActive = formatType ? activeFormats.includes(formatType) : false

  // Use refs to track previous values and prevent unnecessary re-registrations
  const prevDispatcherRef = useRef<((editor: LexicalEditor) => void) | (() => void) | undefined>(undefined)
  const prevItemsRef = useRef<ReactNode[] | undefined>(undefined)
  const prevChildrenRef = useRef<ReactNode | undefined>(undefined)
  const prevTypeRef = useRef<typeof type | undefined>(undefined)
  const prevIdRef = useRef<typeof id | undefined>(undefined)

  useEffect(() => {
    // Extract current values based on type
    const dispatcher = type === "command" ? (props as Extract<ShellToolbarItemProps, { type: "command" }>).dispatcher : undefined
    const items = type === "menu" ? (props as Extract<ShellToolbarItemProps, { type: "menu" }>).items : undefined
    const children = type === "dropdown" ? props.children : undefined
    
    // Check if anything actually changed
    const dispatcherChanged = type === "command" && prevDispatcherRef.current !== dispatcher
    const itemsChanged = type === "menu" && prevItemsRef.current !== items
    const childrenChanged = type === "dropdown" && prevChildrenRef.current !== children
    const typeChanged = prevTypeRef.current !== type
    const idChanged = prevIdRef.current !== id

    // Only register if something actually changed
    if (!dispatcherChanged && !itemsChanged && !childrenChanged && !typeChanged && !idChanged) {
      return
    }

    // Update refs
    prevDispatcherRef.current = dispatcher
    prevItemsRef.current = items
    prevChildrenRef.current = children
    prevTypeRef.current = type
    prevIdRef.current = id

    const options =
      type === "command"
        ? { type: "command" as const, dispatcher: dispatcher! }
        : type === "menu"
          ? { type: "menu" as const, items: items! }
          : { type: "dropdown" as const, children: children! }
    
    const unregister = registerToolbarItem(id, options)
    return () => unregister()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type, registerToolbarItem])

  const handleClick = useCallback(() => {
    if (type !== "command") return
    const dispatcher = (props as Extract<ShellToolbarItemProps, { type: "command" }>).dispatcher
    if (typeof dispatcher !== "function") return
    dispatcher(editor)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, editor])

  const title = typeof description === "string" ? description : undefined
  const triggerIcon = icon ?? <ChevronDown className="h-4 w-4" />

  if (type === "command") {
    return (
      <ShellToolbarButton onClick={handleClick} title={title} size="md" isActive={isActive}>
        {icon ?? null}
      </ShellToolbarButton>
    )
  }

  if (type === "menu") {
    return (
      <DropdownMenu trigger={triggerIcon} title={title} showChevron={false} align={align}>
        <div className="flex flex-col py-1 min-w-[160px]">
          {props.items}
        </div>
      </DropdownMenu>
    )
  }

  if (type === "dropdown") {
    return (
      <DropdownMenuWithClose
        trigger={triggerIcon}
        title={title}
        align={align}
        contentClassName={(props as Extract<ShellToolbarItemProps, { type: "dropdown" }>).contentClassName}
      >
        {props.children}
      </DropdownMenuWithClose>
    )
  }

  return null
}
