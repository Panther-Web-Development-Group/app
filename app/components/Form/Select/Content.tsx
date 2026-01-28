 "use client"
import { type FC } from "react"
import type { SelectContentProps } from "./types"
import { cn } from "@/lib/cn"
import { useSelectContext } from "./Context"

export const SelectContent: FC<SelectContentProps> = ({ className, children, ...props }) => {
  const { open, listboxId, triggerId } = useSelectContext()
  if (!open) return null

  return (
    <div
      {...props}
      id={listboxId}
      role="listbox"
      aria-labelledby={triggerId}
      className={cn(
        "absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-(--pw-border) bg-background shadow-sm",
        className
      )}
    >
      <div className="max-h-64 overflow-auto p-1">
        {children}
      </div>
    </div>
  )
}

