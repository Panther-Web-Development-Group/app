"use client"

import { useCallback, type FC, type ReactNode } from "react"
import type { CSSProperties } from "react"
import { Select as FormSelect } from "@/app/components/Form/Select"
import { cn } from "@/lib/cn"

export interface RTESelectOption {
  value: string
  label: string
  /** Inline style for the option label (e.g. fontFamily for font select) */
  optionStyle?: CSSProperties
  /** ClassName for the option label (e.g. heading size for block select) */
  optionClassName?: string
}

export interface RTESelectOptionGroup {
  label: string
  options: RTESelectOption[]
}

const TOOLBAR_TRIGGER_CLASSES =
  "inline-flex h-8 w-full items-center justify-between gap-1.5 rounded-md border border-foreground/10 dark:border-foreground/20 bg-background px-2 text-xs font-medium text-foreground/90 hover:bg-foreground/5 dark:hover:bg-foreground/10 overflow-hidden"

export interface RTESelectProps {
  /** Current value (single select) */
  value: string
  /** Called when selection changes */
  onValueChange: (value: string) => void
  /** Flat list of options. Ignored if `groups` is provided. */
  options?: RTESelectOption[]
  /** Option groups (label + options). When provided, `options` is ignored. */
  groups?: RTESelectOptionGroup[]
  /** Placeholder when no value or empty value */
  placeholder?: ReactNode
  /** Disabled state */
  disabled?: boolean
  /** Trigger width (e.g. "w-[140px]") */
  triggerClassName?: string
  /** Content dropdown min-width (e.g. "min-w-[140px]") */
  contentClassName?: string
  /** Root wrapper className */
  className?: string
  /** Position of content: "auto" | "bottom" | "top" */
  position?: "auto" | "bottom" | "top"
  /** When provided, called on Escape instead of focusing the trigger (e.g. focus editor) */
  onEscape?: () => void
}

/**
 * Select component styled for the RTE toolbar. Uses the same compact trigger
 * and dropdown styling as other toolbar controls. Supports flat options or
 * option groups.
 */
export const RTESelect: FC<RTESelectProps> = ({
  value,
  onValueChange,
  options = [],
  groups,
  placeholder,
  disabled,
  triggerClassName,
  contentClassName,
  className,
  position = "bottom",
  onEscape,
}) => {
  const handleChange = useCallback(
    (v: string | string[]) => {
      const next = Array.isArray(v) ? v[0] ?? "" : v
      onValueChange(next)
    },
    [onValueChange]
  )

  const flatOptions = groups ? groups.flatMap((g) => g.options) : options
  const selectedOption = flatOptions.find((o) => o.value === value)
  const displayLabel = selectedOption?.label ?? placeholder ?? value

  const renderOptionContent = (opt: RTESelectOption) =>
    opt.optionStyle ?? opt.optionClassName ? (
      <span style={opt.optionStyle} className={cn(opt.optionClassName)}>
        {opt.label}
      </span>
    ) : (
      opt.label
    )

  return (
    <FormSelect
      value={value}
      onValueChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      onEscape={onEscape}
      className={cn("shrink-0", className)}
    >
      <FormSelect.Trigger
        className={cn(TOOLBAR_TRIGGER_CLASSES, triggerClassName)}
      >
        <span className="min-w-0 flex-1 truncate text-left">
          {selectedOption && (selectedOption.optionStyle ?? selectedOption.optionClassName) ? (
            <span
              style={selectedOption.optionStyle}
              className={cn(selectedOption.optionClassName)}
            >
              {displayLabel}
            </span>
          ) : (
            displayLabel
          )}
        </span>
      </FormSelect.Trigger>
      <FormSelect.Content position={position} className={contentClassName}>
        {groups ? (
          groups.map((group) => (
            <FormSelect.Group key={group.label} label={group.label}>
              {group.options.map((opt) => (
                <FormSelect.Option
                  key={opt.value || "empty"}
                  value={opt.value}
                  label={opt.label}
                >
                  {renderOptionContent(opt)}
                </FormSelect.Option>
              ))}
            </FormSelect.Group>
          ))
        ) : (
          options.map((opt) => (
            <FormSelect.Option
              key={opt.value || "empty"}
              value={opt.value}
              label={opt.label}
            >
              {renderOptionContent(opt)}
            </FormSelect.Option>
          ))
        )}
      </FormSelect.Content>
    </FormSelect>
  )
}
