 "use client"
import { type FC } from "react"
import type { ComboboxContentProps } from "./types"
import { cn } from "@/lib/cn"
import { useComboboxContext } from "./Context"

export const ComboboxContent: FC<ComboboxContentProps> = ({ className, children, ...props }) => {
  const { open, listboxId, inputId } = useComboboxContext()
  if (!open) return null

  return (
    <div
      {...props}
      id={listboxId}
      role="listbox"
      aria-labelledby={inputId}
      className={cn(
        "absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-(--pw-border) bg-background shadow-sm",
        className
      )}
    >
      <div className="max-h-64 overflow-auto p-1">{children}</div>
    </div>
  )
}

