"use client"

import { useId, type FC } from "react"
import type { FieldProps } from "./types"
import { cn } from "@/lib/cn"
import { Label } from "../Label"

export const Field: FC<FieldProps> = ({
  className,
  label,
  labelClassName,
  htmlFor: htmlForProp,
  description,
  descriptionClassName,
  error,
  errorClassName,
  required = false,
  children,
  id: idProp,
  ...divProps
}) => {
  const generatedId = useId()
  const fieldId = idProp ?? generatedId
  const controlId = htmlForProp ?? fieldId
  const descriptionId = description ? `${fieldId}-description` : undefined
  const errorId = error ? `${fieldId}-error` : undefined

  return (
    <div {...divProps} className={cn("space-y-1.5", className)} id={fieldId}>
      {label != null && label !== "" ? (
        <Label
          htmlFor={controlId}
          className={cn("block text-sm font-semibold text-foreground/80", labelClassName)}
        >
          {label}
          {required ? <span aria-hidden className="text-red-500"> *</span> : null}
        </Label>
      ) : null}

      {children}

      {description != null && description !== "" ? (
        <div
          id={descriptionId}
          className={cn("text-xs leading-5 text-foreground/70", descriptionClassName)}
        >
          {description}
        </div>
      ) : null}

      {error != null && error !== "" ? (
        <div
          id={errorId}
          role="alert"
          className={cn("text-xs leading-5 text-red-600 dark:text-red-400", errorClassName)}
        >
          {error}
        </div>
      ) : null}
    </div>
  )
}
