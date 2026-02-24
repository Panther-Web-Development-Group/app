"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useCallback, useEffect, useRef } from "react"
import { $getNodeByKey } from "lexical"
import { useBlockSelection } from "../BlockSelectionContext"
import { mergeRegister } from "@lexical/utils"
import { COMMAND_PRIORITY_LOW, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND } from "lexical"
import { InfoIcon, AlertTriangleIcon, LightbulbIcon } from "lucide-react"
import { cn } from "@/lib/cn"
import type { CalloutVariant } from "@/app/components/Form/RTE/nodes/callout"

const VARIANT_ICONS: Record<CalloutVariant, React.ComponentType<{ className?: string }>> = {
  info: InfoIcon,
  warning: AlertTriangleIcon,
  tip: LightbulbIcon,
}

const VARIANT_STYLES: Record<
  CalloutVariant,
  { wrapper: string; icon: string }
> = {
  info: {
    wrapper: "border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10",
    icon: "text-blue-600 dark:text-blue-400",
  },
  warning: {
    wrapper: "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10",
    icon: "text-amber-600 dark:text-amber-400",
  },
  tip: {
    wrapper: "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
}

export interface CalloutBlockComponentProps {
  nodeKey: string
  variant: CalloutVariant
  title?: string
  body: string
}

/**
 * Block component for a Callout (info / warning / tip).
 * Renders in the editor and participates in block selection.
 */
export function CalloutBlockComponent({
  nodeKey,
  variant,
  title,
  body,
}: CalloutBlockComponentProps) {
  const [editor] = useLexicalComposerContext()
  const { selectedNodeKey, selectBlock, clearSelection } = useBlockSelection()
  const isSelected = selectedNodeKey === nodeKey
  const wrapperRef = useRef<HTMLDivElement>(null)
  const styles = VARIANT_STYLES[variant]
  const Icon = VARIANT_ICONS[variant]

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (isSelected) {
        clearSelection()
      } else {
        selectBlock(nodeKey, "callout")
      }
    },
    [isSelected, nodeKey, selectBlock, clearSelection]
  )

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        () => {
          if (isSelected) {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey)
              if (node) {
                node.remove()
                clearSelection()
              }
            })
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        () => {
          if (isSelected) {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey)
              if (node) {
                node.remove()
                clearSelection()
              }
            })
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor, isSelected, nodeKey, clearSelection])

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "editor-block-wrapper my-2 cursor-pointer transition-all rounded-lg border px-3 py-2",
        styles.wrapper,
        isSelected && "ring-2 ring-accent"
      )}
      onClick={handleClick}
    >
      <div className="flex gap-2">
        <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", styles.icon)} aria-hidden />
        <div className="min-w-0 flex-1 text-sm text-foreground/90">
          {title && (
            <p className="font-semibold text-foreground">{title}</p>
          )}
          {body ? (
            <p className="whitespace-pre-wrap">{body}</p>
          ) : (
            <p className="text-foreground/50 italic">Add callout text…</p>
          )}
        </div>
      </div>
    </div>
  )
}

export { CalloutFloatingMenu } from "./FloatingMenu"
export type { CalloutFloatingMenuProps } from "./FloatingMenu"
