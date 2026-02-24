"use client"

import { useId, useMemo, useCallback } from "react"
import type { LexicalEditor } from "lexical"
import type { InitialConfigType } from "@lexical/react/LexicalComposer"
import { cn } from "@/lib/cn"
import { Label } from "../Label"
import { Tooltip } from "@/app/components/Tooltip"
import { Button } from "@/app/components/Button"
import { InfoIcon } from "lucide-react"
import { editorConfig } from "../Editor/config"
import { ThumbnailNode } from "./nodes/thumbnail"
import { CalloutNode } from "./nodes/callout"
import { VideoNode } from "./nodes/video"
import { RTEProvider } from "./Context"
import { importContent as importContentAction } from "./actions/editorState"
import { Shell } from "./Shell"
import type { RTEProps } from "./types"

export function RTERoot({
  initialContent,
  onChange,
  placeholder,
  resetKey = "",
  onFocus,
  onBlur,
  label,
  labelClassName,
  labelIcon,
  labelIconClassName,
  labelName,
  showRequired = true,
  required,
  description,
  descriptionClassName,
  descriptionType = "text",
  collapseOnBlur = true,
  editorClassName,
  editorContainerClassName,
  contentClassName,
  contentMinHeightClassName = "min-h-[300px]",
  autoFocus = false,
  maxLength,
  enabledToolbarItems,
  className,
  id: idProp,
  ...rest
}: RTEProps) {
  const generatedId = useId()
  const inputId = idProp ?? generatedId
  const descriptionId = `${inputId}-description`

  const namespace = useMemo(() => {
    const safeId = inputId.replaceAll(":", "").replaceAll(" ", "")
    return `lexical-editor-${safeId}`
  }, [inputId])

  const importContent = useCallback((editor: LexicalEditor, content: string) => {
    importContentAction(editor, content)
  }, [])

  const initialEditorState = useCallback(() => undefined, [])

  const initialConfig = useMemo<InitialConfigType>(() => {
    const content = initialContent ?? null
    const editorState = content
      ? (editor: LexicalEditor) => importContent(editor, content)
      : undefined
    const baseNodes = editorConfig.nodes.filter(
      (n: { getType?: () => string }) => n.getType?.() !== "video"
    )
    return {
      ...editorConfig,
      namespace,
      editorState,
      nodes: [...baseNodes, ThumbnailNode, CalloutNode, VideoNode],
    }
  }, [namespace, initialContent, importContent])

  const tooltipText = useMemo(
    () => (descriptionType === "tooltip" ? description : undefined),
    [descriptionType, description]
  )

  // Default toolbar items if none are specified
  const defaultToolbarItems = useMemo(
    () =>
      enabledToolbarItems ?? [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "code",
        "list",
        "listOrdered",
        "quote",
      ],
    [enabledToolbarItems]
  )

  return (
    <div className={cn("space-y-1.5", className)} {...rest}>
      {label ?? labelIcon ?? labelName ? (
        <Label
          htmlFor={inputId}
          name={labelName}
          icon={labelIcon}
          iconClassName={cn("text-foreground/70", labelIconClassName)}
          className={cn("block text-sm font-semibold text-foreground/80", labelClassName)}
        >
          {label ? (
            <span className="inline-flex items-center gap-1">
              <span>{label}</span>
              {showRequired && required ? (
                <span aria-hidden className="text-red-500">
                  *
                </span>
              ) : null}
            </span>
          ) : null}
          {tooltipText ? (
            <Tooltip content={tooltipText}>
              <Button
                type="button"
                variant="ghost"
                className="ml-1 h-5! w-5! p-0! rounded border border-(--pw-border) bg-background/10 text-foreground/70 hover:bg-background/20"
                aria-label="More info"
              >
                <InfoIcon className="h-4 w-4" />
              </Button>
            </Tooltip>
          ) : null}
        </Label>
      ) : null}

      <RTEProvider
        resetKey={resetKey}
        namespace={namespace}
        initialConfig={initialConfig}
        initialEditorState={initialEditorState}
        initialContent={initialContent}
        importContent={importContent}
        onFocus={onFocus}
        onBlur={onBlur}
        enabledToolbarItems={defaultToolbarItems}
      >
        <Shell
          inputId={inputId}
          placeholder={placeholder}
          contentClassName={contentClassName}
          contentMinHeightClassName={typeof contentMinHeightClassName === "string" ? contentMinHeightClassName : "min-h-[300px]"}
          required={required}
          descriptionId={descriptionId}
          description={description}
          descriptionClassName={descriptionClassName}
          descriptionType={descriptionType}
          collapseOnBlur={collapseOnBlur}
          editorClassName={editorClassName}
          editorContainerClassName={editorContainerClassName}
          autoFocus={autoFocus}
          maxLength={maxLength}
          onChange={onChange}
        />
      </RTEProvider>
    </div>
  )
}
