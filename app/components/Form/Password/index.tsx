"use client"

import { useId, useState, type FC } from "react"
import type { PasswordProps } from "./types"
import { cn } from "@/lib/cn"
import { Input } from "../Input"
import { Label } from "../Label"
import { Eye, EyeOff } from "lucide-react"

export const Password: FC<PasswordProps> = ({
  className,
  inputClassName,
  showToggle = true,
  label,
  labelClassName,
  description,
  descriptionClassName,
  id: idProp,
  ...inputProps
}) => {
  const [visible, setVisible] = useState(false)
  const generatedId = useId()
  const inputId = idProp ?? generatedId
  const descriptionId = `${inputId}-description`

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <Label
          htmlFor={inputId}
          className={cn("block text-sm font-semibold text-foreground/80", labelClassName)}
        >
          {label}
          {inputProps.required ? (
            <span aria-hidden className="text-red-500"> *</span>
          ) : null}
        </Label>
      ) : null}

      <div className="relative">
        <Input
          {...inputProps}
          id={inputId}
          type={visible ? "text" : "password"}
          aria-describedby={description ? descriptionId : undefined}
          autoComplete={inputProps.autoComplete ?? "current-password"}
          className={cn(
            "h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 pr-10 text-sm text-foreground outline-none",
            "transition-colors focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
            "hover:bg-background/15",
            inputClassName
          )}
        />
        {showToggle ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-foreground/60 hover:bg-background/15 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--pw-ring)"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        ) : null}
      </div>

      {description ? (
        <div
          id={descriptionId}
          className={cn("text-xs leading-5 text-foreground/70", descriptionClassName)}
        >
          {description}
        </div>
      ) : null}
    </div>
  )
}
