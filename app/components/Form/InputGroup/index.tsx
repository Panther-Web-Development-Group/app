"use client"
import { 
  useId, 
  useMemo, 
  useState,
  useCallback, 
  type FC 
} from "react"
import type { InputGroupProps } from "./types"
import { cn } from "@/lib/cn"
import { Label } from "../Label"
import { Button } from "@/app/components/Button"
import { Tooltip } from "@/app/components/Tooltip"
import { Input } from "../Input"
import { InfoIcon } from "lucide-react"

export const InputGroup: FC<InputGroupProps> = (props) => {
  const {
    className,

    // Label props
    label,
    labelClassName,
    labelIcon,
    labelIconClassName,
    labelName,
    showRequired = true,

    // Description props
    description,
    descriptionClassName,
    descriptionType = "text",

    // Icon props
    icon,
    iconClassName,
    inputClassName,

    collapseOnBlur = true,

    id: idProp,
    onFocus,
    onBlur,
    ...inputProps
  } = props

  const generatedId = useId()
  const inputId = idProp ?? generatedId
  const descriptionId = `${inputId}-description`

  const [isFocused, setIsFocused] = useState(false)

  const tooltipText = useMemo(() => {
    if (descriptionType !== "tooltip") return undefined
    return description
  }, [description, descriptionType])

  const showInlineDescription = useMemo(() => {
    return descriptionType !== "tooltip" && !!description && (!collapseOnBlur || isFocused)
  }, [description, descriptionType, collapseOnBlur, isFocused])

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  }, [onFocus])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    onBlur?.(e)
  }, [onBlur])

  return (
    <div className={cn("space-y-1.5", className)}>
      {label || labelIcon || labelName ? (
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
              {showRequired && inputProps.required ? (
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

      <div className="relative">
        {icon ? (
          <span
            className={cn(
              "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60",
              iconClassName,
            )}
          >
            {icon}
          </span>
        ) : null}

        <Input
          {...inputProps}
          id={inputId}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-required={inputProps.required ? true : undefined}
          aria-describedby={showInlineDescription ? descriptionId : undefined}
          className={cn(
            "h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none",
            "transition-colors",
            "focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
            "hover:bg-background/15",
            icon && "pl-10",
            inputClassName,
          )}
        />
      </div>

      {showInlineDescription ? (
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

