"use client"
import {
  useCallback,
  useId,
  type FC
} from "react"
import type { CheckboxProps } from "./types"
import { cn } from "@/lib/cn"
import { Input } from "../Input"
import { Label } from "../Label"
import { CheckIcon } from "lucide-react"

export const Checkbox: FC<CheckboxProps> = (props) => {
  const {
    className,
    label,
    onCheckedChange,
    onChange,
    disabled,
    inputClassName,
    id: idProp,
    ...inputProps
  } = props

  const generatedId = useId()
  const inputId = idProp ?? generatedId

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked)
      onChange?.(e)
    },
    [onCheckedChange, onChange]
  )

  return (
    <div className={cn("flex items-center", className)}>
      <Label
        htmlFor={inputId}
        className={cn(
          "items-center select-none",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        )}
      >
        <Input
          {...inputProps}
          id={inputId}
          onChange={handleChange}
          type="checkbox"
          disabled={disabled}
          className={cn("peer sr-only", inputClassName)}
        />

        <span
          aria-hidden
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded border border-(--pw-border) bg-background/10 text-foreground/70 transition-colors",
            disabled ? "" : "hover:bg-background/20",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-accent/30",
            "peer-checked:[&>svg]:opacity-100"
          )}
        >
          <CheckIcon className="h-4 w-4 opacity-0 transition-opacity" />
        </span>

        {label ? (
          <span className="text-sm font-medium text-foreground/80">{label}</span>
        ) : null}
      </Label>
    </div>
  )
}