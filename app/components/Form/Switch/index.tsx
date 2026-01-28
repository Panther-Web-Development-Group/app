"use client"
import { useCallback, useId, useState, type FC } from "react"
import type { SwitchProps } from "./types"
import { cn } from "@/lib/cn"
import { Label } from "../Label"

export const Switch: FC<SwitchProps> = ({
  className,
  inputClassName,
  label,
  checked: checkedProp,
  defaultChecked,
  onCheckedChange,
  disabled,
  id: idProp,
  ...inputProps
}) => {
  const generatedId = useId()
  const inputId = idProp ?? generatedId

  const isControlled = typeof checkedProp === "boolean"
  const [uncontrolled, setUncontrolled] = useState<boolean>(defaultChecked ?? false)
  const checked = isControlled ? (checkedProp as boolean) : uncontrolled

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.checked
      if (!isControlled) setUncontrolled(next)
      onCheckedChange?.(next)
    },
    [isControlled, onCheckedChange]
  )

  return (
    <div className={cn("flex items-center", className)}>
      <Label
        htmlFor={inputId}
        className={cn(
          "items-center select-none gap-3",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        )}
      >
        <input
          {...inputProps}
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={cn("peer sr-only", inputClassName)}
        />

        <span
          aria-hidden
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-(--pw-border) bg-background/10 transition-colors",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-(--pw-ring)",
            disabled ? "" : "hover:bg-background/15",
            "peer-checked:bg-accent/25"
          )}
        >
          <span
            className={cn(
              "inline-block h-5 w-5 translate-x-0.5 rounded-full bg-foreground/80 shadow-[0_6px_18px_var(--pw-shadow)] transition-transform",
              "peer-checked:translate-x-5"
            )}
          />
        </span>

        {label ? <span className="text-sm font-medium text-foreground/80">{label}</span> : null}
      </Label>
    </div>
  )
}

