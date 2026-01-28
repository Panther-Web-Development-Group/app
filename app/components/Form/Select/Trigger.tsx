 "use client"
import { useCallback, useMemo, type FC } from "react"
import { cn } from "@/lib/cn"
import type { SelectTriggerProps } from "./types"
import { useSelectContext } from "./Context"
import { ChevronDown } from "lucide-react"

function isStringLike(node: React.ReactNode): node is string | number {
  return typeof node === "string" || typeof node === "number"
}

export const SelectTrigger: FC<SelectTriggerProps> = ({
  className,
  children,
  disabled: disabledProp,
  onClick,
  onKeyDown,
  ...buttonProps
}) => {
  const {
    disabled: disabledCtx,
    multiple,
    showMultiple,
    placeholder,
    open,
    setOpen,
    value,
    getOptionLabel,
    triggerId,
    listboxId,
  } = useSelectContext()

  const disabled = disabledCtx || disabledProp

  const display = useMemo(() => {
    if (children) return children

    if (multiple) {
      const arr = Array.isArray(value) ? value : []
      if (arr.length === 0) return placeholder ?? <span className="text-foreground/50">Select…</span>

      const labels = arr
        .map((v) => getOptionLabel(v))
        .filter((l): l is React.ReactNode => l !== undefined)

      if (showMultiple === "expanded") {
        // If everything is string-like, join; otherwise just render the labels inline.
        const allStringy = labels.every(isStringLike)
        return allStringy ? labels.join(", ") : <span className="inline-flex flex-wrap gap-1">{labels}</span>
      }

      // collapsed / overflow / always -> simple "first +N"
      const first = labels[0] ?? arr[0]
      const extra = arr.length - 1
      return (
        <span className="inline-flex items-center gap-2">
          <span className="truncate">{first}</span>
          {extra > 0 ? <span className="text-xs text-foreground/60">+{extra}</span> : null}
        </span>
      )
    }

    const v = typeof value === "string" ? value : undefined
    if (!v) return placeholder ?? <span className="text-foreground/50">Select…</span>
    return getOptionLabel(v) ?? v
  }, [children, getOptionLabel, multiple, placeholder, showMultiple, value])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return
      setOpen(!open)
      onClick?.(e)
    },
    [disabled, onClick, open, setOpen]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      switch (e.key) {
        case "ArrowDown":
        case "ArrowUp":
        case "Enter":
        case " ":
          e.preventDefault()
          if (!disabled) setOpen(true)
          break
        case "Escape":
          setOpen(false)
          break
        default:
          break
      }
      onKeyDown?.(e)
    },
    [disabled, onKeyDown, setOpen]
  )

  return (
    <button
      {...buttonProps}
      id={triggerId}
      type="button"
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listboxId}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none",
        "transition-colors",
        "focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-background/15",
        className
      )}
    >
      <span className="min-w-0 flex-1 truncate text-left">{display}</span>
      <ChevronDown className={cn("h-4 w-4 text-foreground/70 transition-transform", open && "rotate-180")} />
    </button>
  )
}

