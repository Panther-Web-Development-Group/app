"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useCallback, useEffect, useRef } from "react"
import { $getNodeByKey } from "lexical"
import { useBlockSelection } from "../BlockSelectionContext"
import { mergeRegister } from "@lexical/utils"
import { COMMAND_PRIORITY_LOW, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND } from "lexical"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/cn"
import type { QuizQuestion } from "@/app/components/Quiz/types"

export interface QuizBlockComponentProps {
  nodeKey: string
  /** Quiz title */
  title?: string
  /** Optional description */
  description?: string
  /** Quiz questions */
  questions?: QuizQuestion[]
}

/**
 * Block component for a Quiz: renders in the editor and participates in block selection.
 * Used as the decorator for QuizNode when the node is added to the editor config.
 */
export function QuizBlockComponent({
  nodeKey,
  title,
  description,
  questions = [],
}: QuizBlockComponentProps) {
  const [editor] = useLexicalComposerContext()
  const { selectedNodeKey, selectBlock, clearSelection } = useBlockSelection()
  const isSelected = selectedNodeKey === nodeKey
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (isSelected) {
        clearSelection()
      } else {
        selectBlock(nodeKey, "quiz")
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
        "editor-block-wrapper my-4 cursor-pointer transition-all",
        isSelected && "ring-2 ring-accent rounded-lg p-1"
      )}
      onClick={handleClick}
    >
      <div className="rounded-lg border border-foreground/10 dark:border-foreground/20 bg-background/5 overflow-hidden">
        <div className="flex items-center gap-2 p-3 border-b border-foreground/10 dark:border-foreground/20">
          <HelpCircle className="h-4 w-4 text-foreground/60 shrink-0" />
          <span className="text-sm font-medium text-foreground/80">Quiz</span>
        </div>
        <div className="p-3">
          {title || questions.length > 0 ? (
            <div className="space-y-2">
              {title && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground/90">{title}</h3>
                  {description && (
                    <p className="text-xs text-foreground/60 mt-1">{description}</p>
                  )}
                </div>
              )}
              {questions.length > 0 && (
                <div className="space-y-2 mt-3">
                  {questions.slice(0, 3).map((question, i) => (
                    <div
                      key={question.id || i}
                      className="p-2 rounded-md bg-foreground/5 border border-foreground/10"
                    >
                      <p className="text-xs font-medium text-foreground/80 mb-1.5">
                        {i + 1}. {question.prompt}
                      </p>
                      <div className="space-y-1">
                        {question.options.slice(0, 2).map((option, j) => (
                          <div key={option.id || j} className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
                            <span className="text-xs text-foreground/60">{option.label}</span>
                          </div>
                        ))}
                        {question.options.length > 2 && (
                          <p className="text-xs text-foreground/40 ml-3.5">
                            +{question.options.length - 2} more option{question.options.length - 2 !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {questions.length > 3 && (
                    <p className="text-xs text-foreground/40 text-center">
                      +{questions.length - 3} more question{questions.length - 3 !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <HelpCircle className="h-10 w-10 text-foreground/30 mb-2" />
              <p className="text-sm text-foreground/50">No quiz content yet</p>
              <p className="text-xs text-foreground/40 mt-0.5">Add quiz details when editing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { QuizFloatingMenu } from "./FloatingMenu"
export type { QuizFloatingMenuProps } from "./FloatingMenu"
