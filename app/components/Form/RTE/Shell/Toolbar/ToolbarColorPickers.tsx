"use client"

import { useCallback, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { RTEColorPicker } from "../../ColorPicker"
import { formatBackground, formatForeground } from "../../actions/format"
import { 
  PaintBucketIcon, 
  BaselineIcon
} from "lucide-react"

export function ToolbarBackgroundColor() {
  const [editor] = useLexicalComposerContext()
  const [value, setValue] = useState<string>("#fef3c7")

  const onValueChange = useCallback(
    (color: string) => {
      setValue(color)
      formatBackground(editor, color)
    },
    [editor]
  )

  return (
    <RTEColorPicker
      value={value}
      onValueChange={onValueChange}
      defaultValue="#fef3c7"
      triggerAriaLabel="Background color"
    >
      <PaintBucketIcon className="h-4 w-4" />
    </RTEColorPicker>
  )
}

export function ToolbarForegroundColor() {
  const [editor] = useLexicalComposerContext()
  const [value, setValue] = useState<string>("#1f2937")

  const onValueChange = useCallback(
    (color: string) => {
      setValue(color)
      formatForeground(editor, color)
    },
    [editor]
  )

  return (
    <RTEColorPicker
      value={value}
      onValueChange={onValueChange}
      defaultValue="#1f2937"
      triggerAriaLabel="Text color"
    >
      <BaselineIcon className="h-4 w-4" />
    </RTEColorPicker>
  )
}
