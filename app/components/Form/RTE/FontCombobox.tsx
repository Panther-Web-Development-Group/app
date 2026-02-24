"use client"

import { type FC } from "react"
import { Combobox } from "@/app/components/Form/Combobox"
import { cn } from "@/lib/cn"

const TOOLBAR_TRIGGER_CLASSES =
  "h-8 min-w-[8rem] w-[10rem] rounded-md border border-foreground/10 dark:border-foreground/20 bg-background hover:bg-foreground/5 dark:hover:bg-foreground/10 focus-within:ring-2 focus-within:ring-(--pw-ring) focus-within:ring-offset-1"
const TOOLBAR_INPUT_CLASSES =
  "h-8 px-2 text-xs font-medium text-foreground/90 caret-foreground"

export interface FontOption {
  value: string
  label: string
}

export const DEFAULT_FONT_OPTIONS: FontOption[] = [
  { value: "", label: "Default" },
  { value: "var(--font-sans)", label: "Sans" },
  { value: "var(--font-serif)", label: "Serif" },
  { value: "var(--font-mono)", label: "Mono" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "Arial, sans-serif", label: "Arial" },
]

export interface RTEFontComboboxProps {
  value: string
  onValueChange: (value: string) => void
  options?: FontOption[]
  placeholder?: string
  disabled?: boolean
  /** When true (default for RTE), focus stays on editor after select. When false, focus returns to combobox. */
  focusEditorOnSelect?: boolean
  /** When provided, called on Escape (e.g. focus editor) */
  onEscape?: () => void
  className?: string
  inputClassName?: string
  contentClassName?: string
  position?: "auto" | "bottom" | "top"
}

/**
 * Combobox for font family selection in the RTE toolbar. Type to filter options,
 * use Arrow keys to move, Enter to select. Displays each option in its font.
 */
export const RTEFontCombobox: FC<RTEFontComboboxProps> = ({
  value,
  onValueChange,
  options = DEFAULT_FONT_OPTIONS,
  placeholder = "Search fonts…",
  disabled,
  focusEditorOnSelect = true,
  onEscape,
  className,
  inputClassName,
  contentClassName,
  position = "bottom",
}) => {
  return (
    <Combobox
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      disabled={disabled}
      clearOnSelect
      focusInputAfterSelect={!focusEditorOnSelect}
      onEscape={onEscape}
      options={options.map((o) => ({ value: o.value, text: o.label }))}
      className={cn("shrink-0", className)}
    >
      <Combobox.Input
        triggerClassName={cn(TOOLBAR_TRIGGER_CLASSES, inputClassName)}
        className={TOOLBAR_INPUT_CLASSES}
        chevronClassName="h-3.5 w-3.5 mr-1.5"
        aria-label="Font family"
      />
      <Combobox.Content position={position} className={cn("min-w-[10rem]", contentClassName)}>
        {options.map((opt) => (
          <Combobox.Option
            key={opt.value || "default"}
            value={opt.value}
            textValue={opt.label}
          >
            <span
              style={{ fontFamily: opt.value || "inherit" }}
              className="min-w-0 flex-1 truncate"
            >
              {opt.label}
            </span>
          </Combobox.Option>
        ))}
      </Combobox.Content>
    </Combobox>
  )
}
